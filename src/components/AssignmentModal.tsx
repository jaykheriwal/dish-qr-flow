import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';

interface AssignmentModalProps {
  open: boolean;
  tableNumber: number | null;
  restaurantId: string;
  onClose: () => void;
  /** mock api function — replace with real backend call */
  onAssign: (restaurantId: string, tableNumber: number, qrId: string) => Promise<void>;
}

const SCANNER_ID = 'qr-scanner-region';

/**
 * Opens a camera scanner. When a QR is scanned, extracts the claim id from the URL
 * (or uses raw payload as id), then asks for confirmation before assigning.
 */
export default function AssignmentModal({ open, tableNumber, restaurantId, onClose, onAssign }: AssignmentModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraIdx, setActiveCameraIdx] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [pendingQrId, setPendingQrId] = useState<string | null>(null);

  // Extract uuid from a `/claim/<id>` url, else return raw payload
  const extractId = (text: string): string => {
    try {
      const u = new URL(text);
      const m = u.pathname.match(/\/claim\/([^/?#]+)/i);
      if (m) return decodeURIComponent(m[1]);
    } catch { /* not a url */ }
    return text.trim();
  };

  // start the scanner with a given camera index
  const startScanner = async (idx: number) => {
    if (!scannerRef.current) return;
    const cam = cameras[idx];
    if (!cam) return;
    try {
      await scannerRef.current.start(
        cam.id,
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          // pause once we have a hit — confirmation dialog will resume on cancel
          scannerRef.current?.pause(true);
          setPendingQrId(extractId(decodedText));
        },
        () => { /* ignore per-frame parse errors */ },
      );
      setScanning(true);
    } catch (err) {
      console.error('scanner start failed', err);
      toast.error('Could not access camera. Check browser permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try { await scannerRef.current.stop(); } catch { /* ignore */ }
    }
    setScanning(false);
  };

  // Initialise on open
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (cancelled) return;
        if (!devices.length) {
          toast.error('No camera found on this device.');
          return;
        }
        setCameras(devices);
        // prefer back camera if labelled
        const backIdx = devices.findIndex(d => /back|rear|environment/i.test(d.label));
        const idx = backIdx >= 0 ? backIdx : 0;
        setActiveCameraIdx(idx);
        scannerRef.current = new Html5Qrcode(SCANNER_ID, /* verbose */ false);
        await startScanner(idx);
      } catch (err) {
        console.error(err);
        toast.error('Camera access denied or unavailable.');
      }
    })();
    return () => {
      cancelled = true;
      stopScanner().then(() => { scannerRef.current?.clear().catch(() => {}); scannerRef.current = null; });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const switchCamera = async () => {
    if (cameras.length < 2) {
      toast('Only one camera available.');
      return;
    }
    const next = (activeCameraIdx + 1) % cameras.length;
    setActiveCameraIdx(next);
    await stopScanner();
    await startScanner(next);
  };

  const handleConfirm = async () => {
    if (!pendingQrId || tableNumber == null) return;
    try {
      await onAssign(restaurantId, tableNumber, pendingQrId);
      toast.success(`QR assigned to Table ${tableNumber}`);
      setPendingQrId(null);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to assign QR. Try again.');
      // resume scanning
      if (scannerRef.current && scanning) {
        try { scannerRef.current.resume(); } catch { /* ignore */ }
      }
    }
  };

  const handleCancelConfirm = () => {
    setPendingQrId(null);
    if (scannerRef.current && scanning) {
      try { scannerRef.current.resume(); } catch { /* ignore */ }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Scan QR for Table {tableNumber}
            </DialogTitle>
            <DialogDescription>
              Point your camera at the printed QR code. The code will be linked to this table.
            </DialogDescription>
          </DialogHeader>

          <div
            id={SCANNER_ID}
            className="w-full aspect-square bg-muted rounded-lg overflow-hidden"
          />

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button type="button" variant="outline" onClick={switchCamera} disabled={cameras.length < 2}>
              <RotateCcw className="h-4 w-4 mr-2" /> Switch Camera
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={pendingQrId !== null} onOpenChange={(v) => { if (!v) handleCancelConfirm(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Assign QR <span className="font-mono text-foreground">{pendingQrId?.slice(0, 8)}…{pendingQrId?.slice(-4)}</span> to Table {tableNumber}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirm}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
