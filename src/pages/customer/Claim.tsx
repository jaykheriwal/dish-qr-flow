import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { findQRCode } from '@/store/localStore';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode } from 'lucide-react';

/**
 * Landing target for printed QR codes (`/claim/:qrId`).
 * - If the QR has been assigned to a restaurant + table, redirect straight to the menu.
 * - Otherwise show a friendly "not assigned yet" screen.
 *
 * If a customer (rather than the restaurant admin) scans an unassigned QR with a
 * normal phone camera, they land here with clear guidance instead of a 404.
 */
export default function Claim() {
  const { qrId } = useParams<{ qrId: string }>();
  const record = qrId ? findQRCode(qrId) : undefined;

  useEffect(() => {
    document.title = 'QR Claim — QRServe';
  }, []);

  if (record?.assignedRestaurantId && record.assignedTableNumber != null) {
    return <Navigate to={`/order/${record.assignedRestaurantId}/${record.assignedTableNumber}`} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-10 pb-8">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <QrCode className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">This QR isn't linked yet</h1>
          <p className="text-sm text-muted-foreground mt-2">
            The restaurant hasn't assigned this code to a table.
            Please ask a staff member, or scan another QR on your table.
          </p>
          <p className="text-[11px] font-mono text-muted-foreground mt-6 break-all">{qrId}</p>
        </CardContent>
      </Card>
    </div>
  );
}
