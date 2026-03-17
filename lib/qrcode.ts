import QRCode from "qrcode";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://promesse-plum.vercel.app";

/**
 * Génère un QR code SVG (data URL) pour un numéro de tracking.
 * Pointe vers le portail de suivi public.
 */
export async function generateQRCode(trackingNumber: string): Promise<string> {
  const url = `${APP_URL}/track?numero=${trackingNumber}`;
  return QRCode.toDataURL(url, {
    width: 200,
    margin: 2,
    color: { dark: "#1d4ed8", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}
