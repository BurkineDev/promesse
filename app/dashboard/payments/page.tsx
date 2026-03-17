import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PaymentStatus,
  PaymentMethod,
} from "@/types";

export const metadata: Metadata = { title: "Paiements" };

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("payments")
    .select("*, package:packages(tracking_number, destination, client:clients(name))", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: payments, count } = await query;

  const { data: totals } = await supabase
    .from("payments")
    .select("amount, status");

  const totalPaid = totals
    ?.filter((p) => p.status === "PAYE")
    .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const totalPending = totals
    ?.filter((p) => p.status === "EN_ATTENTE")
    .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Paiements</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {count ?? 0} paiement{(count ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/payments/new" className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Ajouter un paiement</span>
          <span className="sm:hidden">Ajouter</span>
        </Link>
      </div>

      {/* Cartes résumé */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-xs text-gray-400 mb-1">Encaissé</p>
          <p className="text-lg font-bold text-green-700">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-400 mb-1">En attente</p>
          <p className="text-lg font-bold text-orange-600">{formatCurrency(totalPending)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-400 mb-1">Total</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(totalPaid + totalPending)}</p>
        </div>
      </div>

      {/* Filtre statut */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
        {(["", "PAYE", "EN_ATTENTE", "REMBOURSE"] as const).map((s) => (
          <Link
            key={s}
            href={s ? `/dashboard/payments?status=${s}` : "/dashboard/payments"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap flex-shrink-0 ${
              status === s || (!status && !s)
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {s ? PAYMENT_STATUS_LABELS[s as PaymentStatus] : "Tous"}
          </Link>
        ))}
      </div>

      {/* Vue mobile : cartes */}
      <div className="md:hidden space-y-3">
        {payments && payments.length > 0 ? (
          payments.map((payment) => {
            const pkg = payment.package as {
              tracking_number: string;
              destination: string;
              client: { name: string } | null;
            } | null;
            return (
              <div key={payment.id} className="card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    {pkg ? (
                      <Link
                        href={`/dashboard/packages?q=${pkg.tracking_number}`}
                        className="font-mono text-sm font-semibold text-blue-700"
                      >
                        {pkg.tracking_number}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                    {pkg?.client?.name && (
                      <p className="text-xs text-gray-500 mt-0.5">{pkg.client.name}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                      payment.status === "PAYE"
                        ? "bg-green-100 text-green-700"
                        : payment.status === "REMBOURSE"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {PAYMENT_STATUS_LABELS[payment.status as PaymentStatus]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {PAYMENT_METHOD_LABELS[payment.method as PaymentMethod]} · {formatDate(payment.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card p-12 text-center text-gray-400 text-sm">
            Aucun paiement trouvé
          </div>
        )}
      </div>

      {/* Vue desktop : tableau */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="table-th">Colis</th>
              <th className="table-th">Client</th>
              <th className="table-th">Destination</th>
              <th className="table-th">Montant</th>
              <th className="table-th">Méthode</th>
              <th className="table-th">Statut</th>
              <th className="table-th">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments && payments.length > 0 ? (
              payments.map((payment) => {
                const pkg = payment.package as {
                  tracking_number: string;
                  destination: string;
                  client: { name: string } | null;
                } | null;
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="table-td">
                      {pkg ? (
                        <Link
                          href={`/dashboard/packages?q=${pkg.tracking_number}`}
                          className="font-mono text-xs text-blue-700 hover:underline"
                        >
                          {pkg.tracking_number}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="table-td text-gray-600">{pkg?.client?.name ?? "—"}</td>
                    <td className="table-td text-gray-600">{pkg?.destination ?? "—"}</td>
                    <td className="table-td font-semibold">{formatCurrency(payment.amount)}</td>
                    <td className="table-td text-gray-500">
                      {PAYMENT_METHOD_LABELS[payment.method as PaymentMethod]}
                    </td>
                    <td className="table-td">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          payment.status === "PAYE"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "REMBOURSE"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {PAYMENT_STATUS_LABELS[payment.status as PaymentStatus]}
                      </span>
                    </td>
                    <td className="table-td text-gray-500 text-xs">
                      {formatDate(payment.created_at)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  Aucun paiement trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
