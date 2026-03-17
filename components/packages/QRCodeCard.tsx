import Image from "next/image";

interface QRCodeCardProps {
  trackingNumber: string;
  qrDataUrl: string;
}

export function QRCodeCard({ trackingNumber, qrDataUrl }: QRCodeCardProps) {
  return (
    <div className="card p-5 flex flex-col items-center gap-3">
      <h2 className="text-sm font-semibold text-gray-700 self-start">
        QR Code
      </h2>
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <Image
          src={qrDataUrl}
          alt={`QR code ${trackingNumber}`}
          width={160}
          height={160}
          unoptimized
        />
      </div>
      <p className="font-mono text-xs text-gray-500 text-center">
        {trackingNumber}
      </p>
      <p className="text-xs text-gray-400 text-center">
        Scanner pour suivre ce colis
      </p>
    </div>
  );
}
