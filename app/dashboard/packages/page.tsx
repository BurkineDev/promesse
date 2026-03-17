import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PackageStatus, STATUS_ORDER } from "@/types";

export const metadata: Metadata = { title: "Colis" };

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("packages")
    .select("*, client:clients(name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `tracking_number.ilike.%${q}%,destination.ilike.%${q}%,description.ilike.%${q}%`
    );
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data: packages, count } = await query;

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Colis</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {count ?? 0} colis enregistré{(count ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/packages/new"
          className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouveau colis</span>
          <span className="sm:hidden">Nouveau</span>
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <form>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Numéro de tracking, destination..."
              className="input pl-9"
            />
            {status && (
              <input type="hidden" name="status" value={status} />
            )}
          </form>
        </div>

        {/* Filtre statut — scroll horizontal sur mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          <Link
            href="/dashboard/packages"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap flex-shrink-0 ${
              !status
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Tous
          </Link>
          {STATUS_ORDER.map((s) => (
            <Link
              key={s}
              href={`/dashboard/packages?status=${s}${q ? `&q=${q}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap flex-shrink-0 ${
                status === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <StatusBadge status={s as PackageStatus} size="sm" />
            </Link>
          ))}
        </div>
      </div>

      {/* Vue mobile : cartes */}
      <div className="md:hidden space-y-3">
        {packages && packages.length > 0 ? (
          packages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/dashboard/packages/${pkg.id}`}
              className="card block p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono font-semibold text-sm text-gray-900">
                  {pkg.tracking_number}
                </span>
                <StatusBadge status={pkg.status as PackageStatus} size="sm" />
              </div>
              <p className="text-sm text-gray-700 font-medium">
                {(pkg.client as { name: string } | null)?.name ?? "Client inconnu"}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">{pkg.destination}</p>
                <p className="text-xs text-gray-400">{formatDate(pkg.created_at)}</p>
              </div>
              {pkg.weight && (
                <p className="text-xs text-gray-400 mt-0.5">{pkg.weight} kg</p>
              )}
            </Link>
          ))
        ) : (
          <div className="card p-12 text-center text-gray-400 text-sm">
            {q || status
              ? "Aucun colis ne correspond aux critères"
              : "Aucun colis enregistré"}
          </div>
        )}
      </div>

      {/* Vue desktop : tableau */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="table-th">Tracking</th>
              <th className="table-th">Client</th>
              <th className="table-th">Destination</th>
              <th className="table-th">Poids</th>
              <th className="table-th">Statut</th>
              <th className="table-th">Date</th>
              <th className="table-th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {packages && packages.length > 0 ? (
              packages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="table-td">
                    <span className="font-mono font-semibold text-xs">
                      {pkg.tracking_number}
                    </span>
                  </td>
                  <td className="table-td text-gray-600">
                    {(pkg.client as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="table-td text-gray-600">{pkg.destination}</td>
                  <td className="table-td text-gray-500">
                    {pkg.weight ? `${pkg.weight} kg` : "—"}
                  </td>
                  <td className="table-td">
                    <StatusBadge
                      status={pkg.status as PackageStatus}
                      size="sm"
                    />
                  </td>
                  <td className="table-td text-gray-500 text-xs">
                    {formatDate(pkg.created_at)}
                  </td>
                  <td className="table-td">
                    <Link
                      href={`/dashboard/packages/${pkg.id}`}
                      className="text-blue-700 hover:underline text-sm font-medium"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  {q || status
                    ? "Aucun colis ne correspond aux critères"
                    : "Aucun colis enregistré"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
