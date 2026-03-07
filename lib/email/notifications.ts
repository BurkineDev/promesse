import { Resend } from "resend";
import { PackageStatus, STATUS_LABELS } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "notifications@promesstrack.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface NotificationPayload {
  clientEmail: string;
  clientName: string;
  trackingNumber: string;
  status: PackageStatus;
  destination: string;
  location?: string;
}

const STATUS_MESSAGES: Partial<Record<PackageStatus, string>> = {
  RECU: "Votre colis a été enregistré et est prêt pour traitement.",
  EXPEDIE: "Votre colis a été expédié et est en route vers sa destination.",
  ARRIVE: "Votre colis est arrivé à destination et attend la livraison.",
  LIVRE: "Votre colis a été livré avec succès. Merci de votre confiance !",
};

export async function sendStatusNotification(
  payload: NotificationPayload
): Promise<void> {
  const { clientEmail, clientName, trackingNumber, status, destination, location } =
    payload;

  if (!STATUS_MESSAGES[status]) return;
  if (!clientEmail) return;

  const trackingUrl = `${APP_URL}/track?numero=${trackingNumber}`;
  const statusLabel = STATUS_LABELS[status];
  const message = STATUS_MESSAGES[status];

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mise à jour de votre colis</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <!-- Header -->
    <div style="background-color:#1d4ed8;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
      <h1 style="color:white;margin:0;font-size:24px;">PromessTrack</h1>
      <p style="color:#bfdbfe;margin:8px 0 0;">Suivi de colis international</p>
    </div>
    <!-- Content -->
    <div style="background-color:white;padding:32px;border-radius:0 0 8px 8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
      <p style="color:#374151;font-size:16px;">Bonjour <strong>${clientName}</strong>,</p>
      <p style="color:#374151;font-size:16px;">${message}</p>

      <!-- Status Badge -->
      <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:24px 0;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Statut actuel</p>
        <p style="margin:0;color:#1d4ed8;font-size:20px;font-weight:bold;">${statusLabel}</p>
        ${location ? `<p style="margin:8px 0 0;color:#6b7280;font-size:14px;">📍 ${location}</p>` : ""}
      </div>

      <!-- Package Info -->
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6;">Numéro de suivi</td>
          <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:bold;text-align:right;border-bottom:1px solid #f3f4f6;">${trackingNumber}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;">Destination</td>
          <td style="padding:8px 0;color:#111827;font-size:14px;text-align:right;">${destination}</td>
        </tr>
      </table>

      <!-- CTA Button -->
      <div style="text-align:center;margin:32px 0 16px;">
        <a href="${trackingUrl}" style="background-color:#1d4ed8;color:white;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;">
          Suivre mon colis
        </a>
      </div>
      <p style="color:#6b7280;font-size:14px;text-align:center;">
        Ou rendez-vous sur <a href="${trackingUrl}" style="color:#1d4ed8;">${APP_URL}/track</a>
        et entrez le numéro <strong>${trackingNumber}</strong>
      </p>
    </div>
    <!-- Footer -->
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">
      PromessTrack — Gestion import-export professionnelle<br>
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </p>
  </div>
</body>
</html>
`;

  await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: `[${trackingNumber}] Votre colis : ${statusLabel}`,
    html,
  });
}
