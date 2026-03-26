import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { PackageStatus, STATUS_LABELS, CATEGORY_LABELS, PackageCategory } from "@/types";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pkg } = await supabase
    .from("packages")
    .select("*, client:clients(*)")
    .eq("id", id)
    .single();

  if (!pkg) notFound();

  const client = pkg.client as {
    name: string; phone?: string; email?: string; address?: string;
  } | null;

  const invoiceNumber = `FAC-${pkg.tracking_number}`;
  const today = formatDate(new Date().toISOString());
  const isPostal = (pkg as Record<string, unknown>).delivery_mode === "POSTAL";
  const postalCost = Number((pkg as Record<string, unknown>).postal_cost ?? 0);
  const basePrice  = Number(pkg.price ?? 0);
  const totalPrice = basePrice;

  // Valeur déclarée pour la douane
  const declaredValue = Number(pkg.declared_value ?? 0);

  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Facture douane — {invoiceNumber}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 12px; color: #111; background: #fff; }
          .page { max-width: 800px; margin: 0 auto; padding: 28px; }

          /* En-tête */
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
          .brand-name { font-size: 20px; font-weight: bold; color: #1d4ed8; }
          .brand-sub  { font-size: 11px; color: #6b7280; margin-top: 2px; }
          .brand-contact { font-size: 10px; color: #9ca3af; margin-top: 6px; line-height: 1.5; }
          .invoice-box { text-align: right; }
          .invoice-title { font-size: 22px; font-weight: bold; color: #111; letter-spacing: 1px; }
          .invoice-sub { font-size: 10px; color: #6b7280; margin-top: 2px; }
          .invoice-number { font-family: monospace; font-size: 15px; font-weight: bold; color: #1d4ed8; margin-top: 4px; }

          /* Séparateur */
          .sep { border-top: 2px solid #1d4ed8; margin: 16px 0; }
          .sep-light { border-top: 1px solid #e5e7eb; margin: 12px 0; }

          /* Grille 2 colonnes */
          .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
          .box-title { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.6px; margin-bottom: 8px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
          .row { margin-bottom: 5px; }
          .row-label { font-size: 9px; color: #9ca3af; }
          .row-value { font-size: 12px; font-weight: 500; }

          /* Tableau articles */
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #1d4ed8; color: #fff; font-size: 10px; text-align: left; padding: 7px 10px; }
          td { padding: 8px 10px; font-size: 11px; border-bottom: 1px solid #f3f4f6; }
          tr:nth-child(even) td { background: #f8fafc; }
          .td-right { text-align: right; }

          /* Totaux */
          .totals { margin-left: auto; width: 260px; }
          .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
          .total-row.bold { font-weight: bold; font-size: 13px; border-top: 2px solid #1d4ed8; padding-top: 8px; margin-top: 4px; color: #1d4ed8; }

          /* Déclaration douanière */
          .customs-box { background: #fefce8; border: 1px solid #fde047; border-radius: 6px; padding: 12px; margin-bottom: 20px; }
          .customs-title { font-size: 11px; font-weight: bold; color: #a16207; margin-bottom: 8px; }
          .customs-item { font-size: 10px; color: #713f12; margin-bottom: 3px; }

          /* Zone signature */
          .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
          .sig-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; min-height: 80px; }
          .sig-label { font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 30px; }

          /* Pied de page */
          .footer { border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 20px; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af; }

          /* Bouton impression */
          .print-btn { position: fixed; bottom: 20px; right: 20px; background: #1d4ed8; color: #fff; border: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(29,78,216,0.4); }
          @media print {
            .print-btn { display: none; }
          }
        `}</style>
      </head>
      <body>
        <div className="page">

          {/* ─── En-tête ─── */}
          <div className="header">
            <div>
              <div className="brand-name">La Promesse Services</div>
              <div className="brand-sub">Canada ↔ Afrique de l&apos;Ouest</div>
              <div className="brand-contact">
                Canada : +1 (263) 866-8387<br />
                Afrique de l&apos;Ouest : +226 76 16 91 96
              </div>
            </div>
            <div className="invoice-box">
              <div className="invoice-title">FACTURE</div>
              <div className="invoice-sub">Déclaration en douane</div>
              <div className="invoice-number">{invoiceNumber}</div>
              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                Émise le {today}
              </div>
            </div>
          </div>

          <div className="sep" />

          {/* ─── Expéditeur + Destinataire ─── */}
          <div className="two-col">
            {/* Expéditeur */}
            <div className="box">
              <div className="box-title">Expéditeur</div>
              {client ? (
                <>
                  <div className="row">
                    <div className="row-label">Nom</div>
                    <div className="row-value">{client.name}</div>
                  </div>
                  {client.phone && (
                    <div className="row">
                      <div className="row-label">Téléphone</div>
                      <div className="row-value">{client.phone}</div>
                    </div>
                  )}
                  {client.email && (
                    <div className="row">
                      <div className="row-label">Email</div>
                      <div className="row-value">{client.email}</div>
                    </div>
                  )}
                  {client.address && (
                    <div className="row">
                      <div className="row-label">Adresse</div>
                      <div className="row-value">{client.address}</div>
                    </div>
                  )}
                  <div className="row">
                    <div className="row-label">Pays d&apos;expédition</div>
                    <div className="row-value">Canada</div>
                  </div>
                </>
              ) : (
                <p style={{ color: "#9ca3af", fontStyle: "italic", fontSize: 11 }}>Non renseigné</p>
              )}
            </div>

            {/* Destinataire */}
            <div className="box">
              <div className="box-title">Destinataire</div>
              {isPostal ? (
                <>
                  <div className="row">
                    <div className="row-label">Nom</div>
                    <div className="row-value">{String((pkg as Record<string, unknown>).postal_recipient_name ?? "—")}</div>
                  </div>
                  <div className="row">
                    <div className="row-label">Téléphone</div>
                    <div className="row-value">{String((pkg as Record<string, unknown>).postal_recipient_phone ?? "—")}</div>
                  </div>
                  <div className="row">
                    <div className="row-label">Adresse</div>
                    <div className="row-value">{String((pkg as Record<string, unknown>).postal_recipient_address ?? "—")}</div>
                  </div>
                </>
              ) : (
                <div className="row">
                  <div className="row-label">Mode de collecte</div>
                  <div className="row-value" style={{ color: "#059669" }}>
                    🏢 Retrait au bureau — Ouagadougou
                  </div>
                </div>
              )}
              <div className="row" style={{ marginTop: 8 }}>
                <div className="row-label">Pays de destination</div>
                <div className="row-value">{pkg.destination}</div>
              </div>
            </div>
          </div>

          {/* ─── Détails envoi ─── */}
          <div className="two-col">
            <div className="box">
              <div className="box-title">Informations colis</div>
              <div className="row">
                <div className="row-label">Numéro de tracking</div>
                <div className="row-value" style={{ fontFamily: "monospace", fontWeight: "bold" }}>{pkg.tracking_number}</div>
              </div>
              <div className="row">
                <div className="row-label">Statut</div>
                <div className="row-value">{STATUS_LABELS[pkg.status as PackageStatus]}</div>
              </div>
              {pkg.weight && (
                <div className="row">
                  <div className="row-label">Poids</div>
                  <div className="row-value">{pkg.weight} kg</div>
                </div>
              )}
              <div className="row">
                <div className="row-label">Date d&apos;enregistrement</div>
                <div className="row-value">{formatDate(pkg.created_at)}</div>
              </div>
            </div>
            <div className="box">
              <div className="box-title">Itinéraire</div>
              <div className="row">
                <div className="row-label">Origine</div>
                <div className="row-value">{pkg.origin ?? "—"}</div>
              </div>
              <div className="row">
                <div className="row-label">Destination</div>
                <div className="row-value">{pkg.destination}</div>
              </div>
              {pkg.category && (
                <div className="row">
                  <div className="row-label">Catégorie douanière</div>
                  <div className="row-value">{CATEGORY_LABELS[pkg.category as PackageCategory]}</div>
                </div>
              )}
              <div className="row">
                <div className="row-label">Mode de livraison</div>
                <div className="row-value">{isPostal ? "Livraison postale" : "Retrait bureau"}</div>
              </div>
            </div>
          </div>

          {/* ─── Déclaration douanière ─── */}
          <div className="customs-box">
            <div className="customs-title">⚠ Déclaration en douane — Contenu du colis</div>
            <div className="customs-item"><strong>Description :</strong> {pkg.description ?? "—"}</div>
            <div className="customs-item"><strong>Valeur déclarée :</strong> {declaredValue > 0 ? `${declaredValue.toFixed(2)} CAD` : "Non renseignée"}</div>
            <div className="customs-item"><strong>Pays d&apos;origine des marchandises :</strong> Canada</div>
            <div className="customs-item"><strong>Usage :</strong> Usage personnel / don familial (non commercial)</div>
          </div>

          {/* ─── Tableau articles ─── */}
          <table>
            <thead>
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th style={{ width: "45%" }}>Description de l&apos;article</th>
                <th style={{ width: "15%" }}>Catégorie</th>
                <th style={{ width: "15%" }}>Poids</th>
                <th style={{ width: "20%", textAlign: "right" }}>Valeur (CAD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>{pkg.description ?? "Contenu divers"}</td>
                <td>{pkg.category ? CATEGORY_LABELS[pkg.category as PackageCategory] : "—"}</td>
                <td>{pkg.weight ? `${pkg.weight} kg` : "—"}</td>
                <td className="td-right">{declaredValue > 0 ? declaredValue.toFixed(2) : "—"}</td>
              </tr>
            </tbody>
          </table>

          {/* ─── Totaux ─── */}
          <div className="totals">
            {basePrice > 0 && (
              <div className="total-row">
                <span>Frais de transport</span>
                <span>{(basePrice - postalCost).toFixed(2)} CAD</span>
              </div>
            )}
            {isPostal && postalCost > 0 && (
              <div className="total-row">
                <span>Frais de livraison postale</span>
                <span>{postalCost.toFixed(2)} CAD</span>
              </div>
            )}
            <div className="total-row bold">
              <span>TOTAL FACTURE</span>
              <span>{totalPrice.toFixed(2)} CAD</span>
            </div>
          </div>

          {/* ─── Signatures ─── */}
          <div className="sig-grid">
            <div className="sig-box">
              <div className="sig-label">Signature expéditeur</div>
            </div>
            <div className="sig-box">
              <div className="sig-label">Cachet La Promesse Services</div>
            </div>
          </div>

          {/* ─── Pied de page ─── */}
          <div className="footer">
            <span>La Promesse Services — {invoiceNumber} — {today}</span>
            <span>Suivi : {pkg.tracking_number}</span>
          </div>
        </div>

        <button className="print-btn" onClick={() => window.print()}>
          🖨️ Imprimer / PDF
        </button>
        <script dangerouslySetInnerHTML={{
          __html: `document.querySelector('.print-btn').addEventListener('click', () => window.print())`
        }} />
      </body>
    </html>
  );
}
