import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy", { locale: fr });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy à HH:mm", { locale: fr });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
