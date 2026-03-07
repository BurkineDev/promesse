import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatDate, formatDateTime } from "@/lib/utils";
import { PackageStatus, STATUS_LABELS, TrackingEvent } from "@/types";

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: pkg }, { data: events }] = await Promise.all([
    supabase
      .from("packages")
      .select("*, client:clients(*)")
      .eq("id", id)
      .single(),
    supabase
      .from("tracking_events")
      .select("*")
      .eq("package_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!pkg) notFound();

  const client = pkg.client as {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  } | null;

  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bordereau — {pkg.tracking_number}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 12px; color: #111; background: white; }
          .page { max-width: 800px; margin: 0 auto; padding: 24px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 20px; }
          .brand { font-size: 22px; font-weight: bold; color: #1d4ed8; }
          .brand-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
          .tracking-box { text-align: right; }
          .tracking-number { font-family: monospace; font-size: 20px; font-weight: bold; background: #eff6ff; border: 2px solid #bfdbfe; padding: 8px 14px; border-radius: 6px; }
          .tracking-label { font-size: 10px; color: #6b7280; margin-bottom: 4px; }
          .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px; background: #dbeafe; color: #1d4ed8; margin-top: 6px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .section { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
          .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 10px; border-bottom: 1px solid #f3f4f6; padding-bottom: 6px; }
          .field { margin-bottom: 6px; }
          .field-label { font-size: 10px; color: #9ca3af; }
          .field-value { font-size: 13px; font-weight: 500; color: #111; }
          .route { display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; }
          .route-loc { flex: 1; }
          .route-label { font-size: 10px; color: #9ca3af; }
          .route-value { font-size: 15px; font-weight: bold; }
          .arrow { font-size: 20px; color: #1d4ed8; }
          .timeline { margin-bottom: 20px; }
          .timeline-item { display: flex; gap: 10px; margin-bottom: 10px; padding-left: 8px; border-left: 2px solid #e5e7eb; }
          .timeline-item:first-child { border-left-color: #1d4ed8; }
          .timeline-dot { width: 8px; height: 8px; border-radius: 50%; background: #1d4ed8; margin-top: 4px; flex-shrink: 0; margin-left: -13px; }
          .timeline-status { font-weight: bold; font-size: 12px; }
          .timeline-meta { font-size: 10px; color: #6b7280; }
          .footer { border-top: 1px solid #e5e7eb; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; }
          .print-btn { position: fixed; bottom: 20px; right: 20px; background: #1d4ed8; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; }
          @media print {
            .print-btn { display: none; }
            body { padding: 0; }
          }
        `}</style>
      </head>
      <body>
        <div className="page">
          {/* Header */}
          <div className="header">
            <div>
              <div className="brand">PromessTrack</div>
              <div className="brand-sub">Gestion import-export</div>
              <div className="brand-sub">Bordereau d&apos;expédition</div>
            </div>
            <div className="tracking-box">
              <div className="tracking-label">Numéro de suivi</div>
              <div className="tracking-number">{pkg.tracking_number}</div>
              <div className="status-badge">
                {STATUS_LABELS[pkg.status as PackageStatus]}
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="route">
            <div className="route-loc">
              <div className="route-label">Origine</div>
              <div className="route-value">{pkg.origin}</div>
            </div>
            <div className="arrow">→</div>
            <div className="route-loc">
              <div className="route-label">Destination</div>
              <div className="route-value">{pkg.destination}</div>
            </div>
            <div className="route-loc" style={{ textAlign: "right" }}>
              <div className="route-label">Date</div>
              <div className="route-value" style={{ fontSize: 13 }}>
                {formatDate(pkg.created_at)}
              </div>
            </div>
          </div>

          {/* Client + package info */}
          <div className="grid">
            <div className="section">
              <div className="section-title">Informations client</div>
              {client ? (
                <>
                  <div className="field">
                    <div className="field-label">Nom</div>
                    <div className="field-value">{client.name}</div>
                  </div>
                  {client.phone && (
                    <div className="field">
                      <div className="field-label">Téléphone</div>
                      <div className="field-value">{client.phone}</div>
                    </div>
                  )}
                  {client.email && (
                    <div className="field">
                      <div className="field-label">Email</div>
                      <div className="field-value">{client.email}</div>
                    </div>
                  )}
                  {client.address && (
                    <div className="field">
                      <div className="field-label">Adresse</div>
                      <div className="field-value">{client.address}</div>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
                  Non renseigné
                </p>
              )}
            </div>

            <div className="section">
              <div className="section-title">Détails du colis</div>
              {pkg.description && (
                <div className="field">
                  <div className="field-label">Description</div>
                  <div className="field-value">{pkg.description}</div>
                </div>
              )}
              {pkg.weight && (
                <div className="field">
                  <div className="field-label">Poids</div>
                  <div className="field-value">{pkg.weight} kg</div>
                </div>
              )}
              {pkg.price && (
                <div className="field">
                  <div className="field-label">Prix</div>
                  <div className="field-value">{pkg.price} CAD</div>
                </div>
              )}
              <div className="field">
                <div className="field-label">Enregistré le</div>
                <div className="field-value">{formatDateTime(pkg.created_at)}</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {events && events.length > 0 && (
            <div>
              <div
                className="section-title"
                style={{ marginBottom: 12, fontSize: 10, fontWeight: "bold", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.5px" }}
              >
                Historique de tracking
              </div>
              <div className="timeline">
                {(events as TrackingEvent[]).map((event) => (
                  <div key={event.id} className="timeline-item">
                    <div>
                      <div className="timeline-status">
                        {STATUS_LABELS[event.status as PackageStatus]}
                      </div>
                      <div className="timeline-meta">
                        {event.location && `📍 ${event.location} — `}
                        {formatDateTime(event.created_at)}
                        {event.notes && ` — ${event.notes}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature zone */}
          <div className="grid" style={{ marginTop: 20 }}>
            <div className="section" style={{ minHeight: 70 }}>
              <div className="section-title">Signature expéditeur</div>
            </div>
            <div className="section" style={{ minHeight: 70 }}>
              <div className="section-title">Signature destinataire</div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <span>PromessTrack — Bordereau généré le {formatDate(new Date().toISOString())}</span>
            <span>
              Suivez ce colis sur promesstrack.com — {pkg.tracking_number}
            </span>
          </div>
        </div>

        <button
          className="print-btn"
          onClick={() => window.print()}
        >
          🖨️ Imprimer
        </button>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.querySelector('.print-btn').addEventListener('click', () => window.print())`,
          }}
        />
      </body>
    </html>
  );
}
