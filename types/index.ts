export type UserRole = "admin" | "agent" | "client";

export type PackageStatus =
  | "RECU"
  | "ENTREPOT"
  | "EXPEDIE"
  | "EN_TRANSIT"
  | "ARRIVE"
  | "LIVRE";

export type PaymentMethod = "CASH" | "VIREMENT" | "CARTE" | "MOBILE";
export type PaymentStatus = "EN_ATTENTE" | "PAYE" | "REMBOURSE";

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
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

export interface Package {
  id: string;
  tracking_number: string;
  client_id: string | null;
  description: string | null;
  weight: number | null;
  destination: string;
  origin: string;
  status: PackageStatus;
  photo_url: string | null;
  price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  client?: Client;
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

export interface Payment {
  id: string;
  package_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  package?: Package;
}

export interface DashboardStats {
  packages_today: number;
  packages_in_transit: number;
  packages_delivered: number;
  packages_total: number;
  clients_total: number;
  revenue_total: number;
  revenue_pending: number;
}

export const STATUS_LABELS: Record<PackageStatus, string> = {
  RECU: "Reçu",
  ENTREPOT: "En entrepôt",
  EXPEDIE: "Expédié",
  EN_TRANSIT: "En transit",
  ARRIVE: "Arrivé",
  LIVRE: "Livré",
};

export const STATUS_COLORS: Record<PackageStatus, string> = {
  RECU: "bg-gray-100 text-gray-700",
  ENTREPOT: "bg-yellow-100 text-yellow-700",
  EXPEDIE: "bg-blue-100 text-blue-700",
  EN_TRANSIT: "bg-purple-100 text-purple-700",
  ARRIVE: "bg-orange-100 text-orange-700",
  LIVRE: "bg-green-100 text-green-700",
};

export const STATUS_ORDER: PackageStatus[] = [
  "RECU",
  "ENTREPOT",
  "EXPEDIE",
  "EN_TRANSIT",
  "ARRIVE",
  "LIVRE",
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Espèces",
  VIREMENT: "Virement",
  CARTE: "Carte",
  MOBILE: "Mobile Money",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  EN_ATTENTE: "En attente",
  PAYE: "Payé",
  REMBOURSE: "Remboursé",
};
