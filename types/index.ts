export type UserRole = "admin" | "agent" | "client";

export type PackageStatus =
  | "SOUMIS"
  | "EN_ATTENTE_VALIDATION"
  | "RECU"
  | "EN_PREPARATION"
  | "PRET_DEPART"
  | "EXPEDIE"
  | "EN_TRANSIT"
  | "EN_COURS_LIVRAISON"
  | "ARRIVE"
  | "LIVRE"
  | "INCIDENT"
  | "ANNULE";

export type PackageCategory =
  | "VETEMENTS"
  | "ELECTRONIQUE"
  | "ALIMENTAIRE"
  | "MEDICAMENTS"
  | "COSMETIQUES"
  | "DOCUMENTS"
  | "MATERIEL_SCOLAIRE"
  | "ELECTROMENAGER"
  | "DIVERS";

export type Direction = "CA_TO_BF" | "BF_TO_CA";
export type Transport = "AIR" | "SEA" | "LAND";
export type PaymentMethod = "CASH" | "VIREMENT" | "CARTE" | "MOBILE";
export type PaymentStatus = "EN_ATTENTE" | "PAYE" | "REMBOURSE";

export type IncidentType =
  | "COLIS_ENDOMMAGE"
  | "COLIS_PERDU"
  | "BLOQUE_DOUANE"
  | "INFORMATIONS_INCOMPLETES"
  | "RETARD"
  | "NON_RECUPERE"
  | "AUTRE";

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  phone: string | null;
  push_token: string | null;
  notification_prefs: { email: boolean; push: boolean };
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  direction: Direction;
  transport: Transport;
  duration_days: number | null;
  base_price: number;
  price_per_kg: number;
  is_active: boolean;
  created_at: string;
}

export interface Shipment {
  id: string;
  name: string;
  route_id: string | null;
  direction: Direction;
  transport: Transport;
  departure_date: string | null;
  arrival_date: string | null;
  status: "PLANIFIE" | "EN_COURS" | "ARRIVE" | "FERME";
  notes: string | null;
  created_at: string;
  updated_at: string;
  route?: Route;
  _count?: { packages: number };
}

export interface Package {
  id: string;
  tracking_number: string;
  client_id: string | null;
  description: string | null;
  category: PackageCategory;
  weight: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  declared_value: number | null;
  destination: string;
  origin: string;
  direction: Direction;
  status: PackageStatus;
  is_urgent: boolean;
  photo_url: string | null;
  price: number | null;
  estimated_price: number | null;
  notes: string | null;
  shipment_id: string | null;
  assigned_agent: string | null;
  submitted_by: string | null;
  qr_code_url: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  shipment?: Shipment;
}

export interface TrackingEvent {
  id: string;
  package_id: string;
  status: PackageStatus;
  location: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Incident {
  id: string;
  package_id: string;
  type: IncidentType;
  description: string | null;
  status: "OUVERT" | "EN_TRAITEMENT" | "RESOLU" | "FERME";
  resolved_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  package_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  package?: Package;
}

export interface DashboardStats {
  packages_today: number;
  packages_pending_validation: number;
  packages_in_transit: number;
  packages_delivered: number;
  packages_incident: number;
  packages_total: number;
  clients_total: number;
  revenue_total: number;
  revenue_pending: number;
}

// ─── Labels ──────────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<PackageStatus, string> = {
  SOUMIS:                "Soumis",
  EN_ATTENTE_VALIDATION: "En attente de validation",
  RECU:                  "Reçu en agence",
  EN_PREPARATION:        "En préparation",
  PRET_DEPART:           "Prêt au départ",
  EXPEDIE:               "Expédié",
  EN_TRANSIT:            "En transit",
  EN_COURS_LIVRAISON:    "En cours de livraison",
  ARRIVE:                "Arrivé",
  LIVRE:                 "Livré",
  INCIDENT:              "Incident",
  ANNULE:                "Annulé",
};

export const STATUS_COLORS: Record<PackageStatus, string> = {
  SOUMIS:                "bg-slate-100 text-slate-700",
  EN_ATTENTE_VALIDATION: "bg-yellow-100 text-yellow-800",
  RECU:                  "bg-gray-100 text-gray-700",
  EN_PREPARATION:        "bg-amber-100 text-amber-700",
  PRET_DEPART:           "bg-cyan-100 text-cyan-700",
  EXPEDIE:               "bg-blue-100 text-blue-700",
  EN_TRANSIT:            "bg-violet-100 text-violet-700",
  EN_COURS_LIVRAISON:    "bg-indigo-100 text-indigo-700",
  ARRIVE:                "bg-orange-100 text-orange-700",
  LIVRE:                 "bg-green-100 text-green-700",
  INCIDENT:              "bg-red-100 text-red-700",
  ANNULE:                "bg-gray-100 text-gray-400",
};

export const STATUS_ICONS: Record<PackageStatus, string> = {
  SOUMIS:                "📝",
  EN_ATTENTE_VALIDATION: "⏳",
  RECU:                  "📦",
  EN_PREPARATION:        "🏭",
  PRET_DEPART:           "🔖",
  EXPEDIE:               "✈️",
  EN_TRANSIT:            "🚢",
  EN_COURS_LIVRAISON:    "🛵",
  ARRIVE:                "📍",
  LIVRE:                 "✅",
  INCIDENT:              "🚨",
  ANNULE:                "❌",
};

export const STATUS_ORDER: PackageStatus[] = [
  "SOUMIS",
  "EN_ATTENTE_VALIDATION",
  "RECU",
  "EN_PREPARATION",
  "PRET_DEPART",
  "EXPEDIE",
  "EN_TRANSIT",
  "EN_COURS_LIVRAISON",
  "ARRIVE",
  "LIVRE",
];

export const CATEGORY_LABELS: Record<PackageCategory, string> = {
  VETEMENTS:        "Vêtements & Chaussures",
  ELECTRONIQUE:     "Électronique",
  ALIMENTAIRE:      "Alimentaire",
  MEDICAMENTS:      "Médicaments",
  COSMETIQUES:      "Cosmétiques",
  DOCUMENTS:        "Documents",
  MATERIEL_SCOLAIRE:"Matériel scolaire",
  ELECTROMENAGER:   "Électroménager",
  DIVERS:           "Divers",
};

export const DIRECTION_LABELS: Record<Direction, string> = {
  CA_TO_BF: "🇨🇦 Montréal → Afrique",
  BF_TO_CA: "🌍 Afrique → Montréal",
};

export const TRANSPORT_LABELS: Record<Transport, string> = {
  AIR:  "✈️ Aérien",
  SEA:  "🚢 Maritime",
  LAND: "🚛 Terrestre",
};

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  COLIS_ENDOMMAGE:          "Colis endommagé",
  COLIS_PERDU:              "Colis perdu",
  BLOQUE_DOUANE:            "Bloqué en douane",
  INFORMATIONS_INCOMPLETES: "Informations incomplètes",
  RETARD:                   "Retard",
  NON_RECUPERE:             "Non récupéré",
  AUTRE:                    "Autre",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH:     "Espèces",
  VIREMENT: "Virement",
  CARTE:    "Carte",
  MOBILE:   "Mobile Money",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  EN_ATTENTE: "En attente",
  PAYE:       "Payé",
  REMBOURSE:  "Remboursé",
};

// ─── Price estimation ─────────────────────────────────────────────────────────

export function estimatePrice(
  weight: number,
  route: Pick<Route, "base_price" | "price_per_kg">,
  isUrgent = false
): number {
  const base = route.base_price + weight * route.price_per_kg;
  const urgentFee = isUrgent ? base * 0.2 : 0;
  return Math.round((base + urgentFee) * 100) / 100;
}
