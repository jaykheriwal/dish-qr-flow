import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type { QRCodeRecord } from '@/types';

interface QRGridProps {
  codes: QRCodeRecord[];
  /** base url; each QR encodes `${baseUrl}/claim/{id}` */
  baseUrl?: string;
  title?: string;
}

/**
 * Printable A4 grid of claim QR codes. The "Print Sheet" button triggers
 * window.print(); print-only CSS in index.css hides everything except `.printable-grid`.
 */
export default function QRGrid({ codes, baseUrl, title = 'QR Claim Sheet' }: QRGridProps) {
  const origin = baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const ref = useRef<HTMLDivElement>(null);

  if (!codes.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No QR codes generated yet. Click "Generate Batch" to create some.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 no-print">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{codes.length} codes — A4 sheet, 4 columns × 5 rows per page.</p>
        </div>
        <Button onClick={() => window.print()} className="gradient-primary text-primary-foreground">
          <Printer className="h-4 w-4 mr-2" /> Print Sheet
        </Button>
      </div>

      <div ref={ref} className="printable-grid">
        {codes.map((code, i) => {
          const url = `${origin}/claim/${code.id}`;
          // every 20 items insert a page break wrapper via CSS class
          const isPageBreak = (i + 1) % 20 === 0 && i !== codes.length - 1;
          return (
            <div
              key={code.id}
              className={`qr-cell ${isPageBreak ? 'page-break' : ''}`}
            >
              <QRCodeSVG value={url} size={140} level="M" />
              <p className="qr-label">{code.id.slice(0, 8)}…{code.id.slice(-4)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
