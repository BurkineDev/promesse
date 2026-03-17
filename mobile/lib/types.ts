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

export const STATUS_LABELS: Record<PackageStatus, string> = {
  SOUMIS:                "Soumis",
  EN_ATTENTE_VALIDATION: "En attente",
  RECU:                  "Reçu",
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

export const STATUS_COLORS: Record<PackageStatus, { bg: string; text: string }> = {
  SOUMIS:                { bg: "#f3f4f6", text: "#6b7280" },
  EN_ATTENTE_VALIDATION: { bg: "#fef9c3", text: "#854d0e" },
  RECU:                  { bg: "#dbeafe", text: "#1d4ed8" },
  EN_PREPARATION:        { bg: "#e0e7ff", text: "#3730a3" },
  PRET_DEPART:           { bg: "#fce7f3", text: "#9d174d" },
  EXPEDIE:               { bg: "#ffedd5", text: "#c2410c" },
  EN_TRANSIT:            { bg: "#fef3c7", text: "#b45309" },
  EN_COURS_LIVRAISON:    { bg: "#d1fae5", text: "#065f46" },
  ARRIVE:                { bg: "#d1fae5", text: "#065f46" },
  LIVRE:                 { bg: "#dcfce7", text: "#15803d" },
  INCIDENT:              { bg: "#fee2e2", text: "#991b1b" },
  ANNULE:                { bg: "#f3f4f6", text: "#6b7280" },
};

export interface Package {
  id: string;
  tracking_number: string;
  status: PackageStatus;
  description: string | null;
  weight: number | null;
  destination: string;
  origin: string;
  category: string;
  estimated_price: number | null;
  is_urgent: boolean;
  created_at: string;
  qr_code_url: string | null;
  photo_url: string | null;
}

export interface TrackingEvent {
  id: string;
  package_id: string;
  status: string;
  location: string | null;
  notes: string | null;
  created_at: string;
}

export interface Route {
  id: string;
  name: string;
  direction: string;
  transport: string;
  origin_city: string;
  destination_city: string;
  base_price: number;
  price_per_kg: number;
}

export type PackageCategory = "DOCUMENT" | "VETEMENT" | "ELECTRONIQUE" | "ALIMENTAIRE" | "MEDICAMENT" | "AUTRE";

export const CATEGORY_LABELS: Record<PackageCategory, string> = {
  DOCUMENT:     "Document",
  VETEMENT:     "Vêtement",
  ELECTRONIQUE: "Électronique",
  ALIMENTAIRE:  "Alimentaire",
  MEDICAMENT:   "Médicament",
  AUTRE:        "Autre",
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(amount);
}

export function estimatePrice(route: Route, weight: number, isUrgent: boolean): number {
  const base = route.base_price + weight * route.price_per_kg;
  return isUrgent ? base * 1.2 : base;
}
