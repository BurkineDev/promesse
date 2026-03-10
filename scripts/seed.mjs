/**
 * PromessTrack — Script de données de démonstration
 *
 * Usage :
 *   node scripts/seed.mjs
 *
 * Nécessite SUPABASE_SERVICE_ROLE_KEY dans .env.local
 * (la service role key bypass le RLS pour l'insertion)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Charger .env.local manuellement
const envPath = resolve(__dirname, "../.env.local");
try {
  const env = readFileSync(envPath, "utf-8");
  for (const line of env.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
} catch {
  console.error("⚠️  Fichier .env.local introuvable.");
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ============================================================
// DONNÉES DE DÉMONSTRATION
// ============================================================

const clients = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    name: "Aminata Traoré",
    phone: "+1 514-555-0101",
    email: "aminata.traore@gmail.com",
    address: "4521 Rue Saint-Denis, Montréal, QC H2J 2L4",
    notes: "Cliente régulière — famille à Ouagadougou",
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",
    name: "Boubacar Diallo",
    phone: "+1 514-555-0202",
    email: "b.diallo@hotmail.com",
    address: "1780 Boulevard Pie-IX, Montréal, QC H1V 2C3",
    notes: "Commerçant — importe des tissus et gadgets électroniques",
  },
  {
    id: "c1000000-0000-0000-0000-000000000003",
    name: "Fatima Ouédraogo",
    phone: "+1 450-555-0303",
    email: "fatima.ouedraogo@yahoo.fr",
    address: "2300 Boulevard Daniel-Johnson, Laval, QC H7T 2P6",
    notes: null,
  },
  {
    id: "c1000000-0000-0000-0000-000000000004",
    name: "Ibrahim Koné",
    phone: "+1 450-555-0404",
    email: "ibrahim.kone@gmail.com",
    address: "8500 Boulevard Taschereau, Brossard, QC J4X 1C4",
    notes: "Préfère être contacté par WhatsApp",
  },
  {
    id: "c1000000-0000-0000-0000-000000000005",
    name: "Marie-Claire Sawadogo",
    phone: "+1 514-555-0505",
    email: "mc.sawadogo@gmail.com",
    address: "6789 Avenue du Parc, Montréal, QC H3N 1X5",
    notes: "Envoie régulièrement des colis à sa mère",
  },
];

const packages = [
  {
    id: "p1000000-0000-0000-0000-000000000001",
    tracking_number: "IMP-2026-0001",
    client_id: "c1000000-0000-0000-0000-000000000001",
    description: "Vêtements, chaussures et médicaments",
    weight: 18.5,
    destination: "Ouagadougou, Burkina Faso",
    origin: "Montréal, Canada",
    status: "LIVRE",
    price: 120.0,
    notes: "Livré sans problème",
  },
  {
    id: "p1000000-0000-0000-0000-000000000002",
    tracking_number: "IMP-2026-0002",
    client_id: "c1000000-0000-0000-0000-000000000002",
    description: "Téléphones reconditionnés et accessoires électroniques",
    weight: 9.2,
    destination: "Dakar, Sénégal",
    origin: "Montréal, Canada",
    status: "EN_TRANSIT",
    price: 95.0,
    notes: "Cargaison maritime — conteneur MSCU4521876",
  },
  {
    id: "p1000000-0000-0000-0000-000000000003",
    tracking_number: "IMP-2026-0003",
    client_id: "c1000000-0000-0000-0000-000000000003",
    description: "Produits cosmétiques et soins capillaires",
    weight: 5.8,
    destination: "Abidjan, Côte d'Ivoire",
    origin: "Montréal, Canada",
    status: "EXPEDIE",
    price: 75.0,
    notes: null,
  },
  {
    id: "p1000000-0000-0000-0000-000000000004",
    tracking_number: "IMP-2026-0004",
    client_id: "c1000000-0000-0000-0000-000000000004",
    description: "Matériel scolaire et livres",
    weight: 12.0,
    destination: "Bamako, Mali",
    origin: "Montréal, Canada",
    status: "ENTREPOT",
    price: 80.0,
    notes: "En attente de consolidation avec autres colis",
  },
  {
    id: "p1000000-0000-0000-0000-000000000005",
    tracking_number: "IMP-2026-0005",
    client_id: "c1000000-0000-0000-0000-000000000005",
    description: "Vêtements enfants et jouets",
    weight: 7.3,
    destination: "Ouagadougou, Burkina Faso",
    origin: "Montréal, Canada",
    status: "ARRIVE",
    price: 65.0,
    notes: "Dédouanement en cours",
  },
  {
    id: "p1000000-0000-0000-0000-000000000006",
    tracking_number: "IMP-2026-0006",
    client_id: "c1000000-0000-0000-0000-000000000001",
    description: "Épices, thé et produits alimentaires non périssables",
    weight: 3.5,
    destination: "Lomé, Togo",
    origin: "Montréal, Canada",
    status: "RECU",
    price: 45.0,
    notes: null,
  },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function hoursAgo(n) {
  return new Date(Date.now() - n * 3600000).toISOString();
}

const trackingEvents = [
  // IMP-2026-0001 — LIVRÉ (historique complet)
  { package_id: "p1000000-0000-0000-0000-000000000001", status: "RECU",       location: "Montréal, Canada",          notes: "Colis enregistré et pesé",                      created_at: daysAgo(30) },
  { package_id: "p1000000-0000-0000-0000-000000000001", status: "ENTREPOT",   location: "Entrepôt Montréal",         notes: "Consolidé avec d'autres envois",                 created_at: daysAgo(28) },
  { package_id: "p1000000-0000-0000-0000-000000000001", status: "EXPEDIE",    location: "Aéroport YUL, Montréal",    notes: "Vol Air Maroc AT201 — départ 22h15",             created_at: daysAgo(25) },
  { package_id: "p1000000-0000-0000-0000-000000000001", status: "EN_TRANSIT", location: "Aéroport CMN, Casablanca",  notes: "Escale technique — 4h d'attente",                created_at: daysAgo(24) },
  { package_id: "p1000000-0000-0000-0000-000000000001", status: "ARRIVE",     location: "Aéroport OUA, Ouagadougou", notes: "Dédouanement effectué",                         created_at: daysAgo(18) },
  { package_id: "p1000000-0000-0000-0000-000000000001", status: "LIVRE",      location: "Ouagadougou, Secteur 15",   notes: "Remis à la destinataire en mains propres",      created_at: daysAgo(15) },

  // IMP-2026-0002 — EN TRANSIT
  { package_id: "p1000000-0000-0000-0000-000000000002", status: "RECU",       location: "Montréal, Canada",    notes: "Colis enregistré",                      created_at: daysAgo(12) },
  { package_id: "p1000000-0000-0000-0000-000000000002", status: "ENTREPOT",   location: "Entrepôt Montréal",   notes: "En attente de départ maritime",          created_at: daysAgo(10) },
  { package_id: "p1000000-0000-0000-0000-000000000002", status: "EXPEDIE",    location: "Port de Montréal",    notes: "Chargé sur cargo MSC Dakar Express",     created_at: daysAgo(8)  },
  { package_id: "p1000000-0000-0000-0000-000000000002", status: "EN_TRANSIT", location: "Océan Atlantique",    notes: "En route — arrivée estimée dans 6 jours", created_at: daysAgo(3) },

  // IMP-2026-0003 — EXPÉDIÉ
  { package_id: "p1000000-0000-0000-0000-000000000003", status: "RECU",     location: "Montréal, Canada",       notes: "Colis enregistré et emballé",      created_at: daysAgo(6) },
  { package_id: "p1000000-0000-0000-0000-000000000003", status: "ENTREPOT", location: "Entrepôt Montréal",      notes: "Prêt pour expédition",             created_at: daysAgo(5) },
  { package_id: "p1000000-0000-0000-0000-000000000003", status: "EXPEDIE",  location: "Aéroport YUL, Montréal", notes: "Vol Ethiopian Airlines ET509",     created_at: daysAgo(2) },

  // IMP-2026-0004 — EN ENTREPÔT
  { package_id: "p1000000-0000-0000-0000-000000000004", status: "RECU",     location: "Montréal, Canada",  notes: "Colis enregistré",                                created_at: daysAgo(3) },
  { package_id: "p1000000-0000-0000-0000-000000000004", status: "ENTREPOT", location: "Entrepôt Montréal", notes: "Consolidation en cours — 2/5 colis pour Bamako", created_at: daysAgo(2) },

  // IMP-2026-0005 — ARRIVÉ
  { package_id: "p1000000-0000-0000-0000-000000000005", status: "RECU",       location: "Montréal, Canada",          notes: "Colis enregistré",                      created_at: daysAgo(20) },
  { package_id: "p1000000-0000-0000-0000-000000000005", status: "ENTREPOT",   location: "Entrepôt Montréal",         notes: "En attente d'expédition",               created_at: daysAgo(18) },
  { package_id: "p1000000-0000-0000-0000-000000000005", status: "EXPEDIE",    location: "Aéroport YUL, Montréal",    notes: "Vol direct Air Burkina",                 created_at: daysAgo(15) },
  { package_id: "p1000000-0000-0000-0000-000000000005", status: "EN_TRANSIT", location: "Aéroport CDG, Paris",       notes: "Escale Paris — correspondance",          created_at: daysAgo(14) },
  { package_id: "p1000000-0000-0000-0000-000000000005", status: "ARRIVE",     location: "Aéroport OUA, Ouagadougou", notes: "Dédouanement en cours — 1 à 2 jours",   created_at: daysAgo(1)  },

  // IMP-2026-0006 — REÇU (tout juste arrivé)
  { package_id: "p1000000-0000-0000-0000-000000000006", status: "RECU", location: "Montréal, Canada", notes: "Colis enregistré et contrôlé", created_at: hoursAgo(2) },
];

const payments = [
  { package_id: "p1000000-0000-0000-0000-000000000001", amount: 120.0, method: "CASH",     status: "PAYE",       notes: "Payé en espèces à la remise du colis" },
  { package_id: "p1000000-0000-0000-0000-000000000002", amount:  95.0, method: "VIREMENT", status: "PAYE",       notes: "Virement Interac — réf. TXN-20260228" },
  { package_id: "p1000000-0000-0000-0000-000000000003", amount:  75.0, method: "MOBILE",   status: "EN_ATTENTE", notes: "En attente de confirmation Mobile Money" },
  { package_id: "p1000000-0000-0000-0000-000000000004", amount:  80.0, method: "CASH",     status: "EN_ATTENTE", notes: "Solde à payer à l'expédition" },
  { package_id: "p1000000-0000-0000-0000-000000000005", amount:  65.0, method: "CARTE",    status: "PAYE",       notes: "Visa — 4 derniers chiffres : 4242" },
  { package_id: "p1000000-0000-0000-0000-000000000006", amount:  45.0, method: "CASH",     status: "EN_ATTENTE", notes: "À encaisser" },
];

// ============================================================
// INSERTION
// ============================================================
async function seed() {
  console.log("🌱 Insertion des données de démonstration PromessTrack\n");

  // Clients
  process.stdout.write("📋 Clients... ");
  const { error: cErr } = await supabase.from("clients").upsert(clients, { onConflict: "id" });
  if (cErr) { console.error("ERREUR:", cErr.message); process.exit(1); }
  console.log(`✅ ${clients.length} clients`);

  // Packages
  process.stdout.write("📦 Colis... ");
  const { error: pErr } = await supabase.from("packages").upsert(packages, { onConflict: "id" });
  if (pErr) { console.error("ERREUR:", pErr.message); process.exit(1); }
  console.log(`✅ ${packages.length} colis`);

  // Tracking events (delete first to avoid duplicates on re-run)
  process.stdout.write("📍 Événements de tracking... ");
  const pkgIds = packages.map(p => p.id);
  await supabase.from("tracking_events").delete().in("package_id", pkgIds);
  const { error: tErr } = await supabase.from("tracking_events").insert(trackingEvents);
  if (tErr) { console.error("ERREUR:", tErr.message); process.exit(1); }
  console.log(`✅ ${trackingEvents.length} événements`);

  // Payments (delete first)
  process.stdout.write("💳 Paiements... ");
  await supabase.from("payments").delete().in("package_id", pkgIds);
  const { error: payErr } = await supabase.from("payments").insert(payments);
  if (payErr) { console.error("ERREUR:", payErr.message); process.exit(1); }
  console.log(`✅ ${payments.length} paiements`);

  console.log("\n✅ Données insérées avec succès !\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🖥️  CÔTÉ ADMINISTRATEUR");
  console.log("   → https://promesse-plum.vercel.app/auth/login");
  console.log("   Email    : admin@promesstrack.com");
  console.log("   Password : Demo2026!");
  console.log("");
  console.log("📱 CÔTÉ CLIENT — Numéros à tester :");
  console.log("   IMP-2026-0001  →  ✅ LIVRÉ (historique complet)");
  console.log("   IMP-2026-0002  →  🚢 EN TRANSIT (cargo maritime)");
  console.log("   IMP-2026-0003  →  ✈️  EXPÉDIÉ (vol Ethiopian)");
  console.log("   IMP-2026-0004  →  🏭 EN ENTREPÔT");
  console.log("   IMP-2026-0005  →  📍 ARRIVÉ (dédouanement)");
  console.log("   IMP-2026-0006  →  📦 REÇU (ce matin)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

seed().catch(console.error);
