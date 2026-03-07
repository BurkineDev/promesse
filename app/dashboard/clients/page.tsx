import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: clients, count } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {count ?? 0} client{(count ?? 0) > 1 ? "s" : ""} enregistré
            {(count ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/clients/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau client
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <form>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Rechercher par nom, email ou téléphone..."
            className="input pl-9"
          />
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="table-th">Nom</th>
              <th className="table-th">Téléphone</th>
              <th className="table-th">Email</th>
              <th className="table-th">Adresse</th>
              <th className="table-th">Depuis</th>
              <th className="table-th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients && clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td font-medium">{client.name}</td>
                  <td className="table-td text-gray-600">{client.phone ?? "—"}</td>
                  <td className="table-td text-gray-600">{client.email ?? "—"}</td>
                  <td className="table-td text-gray-600 max-w-xs truncate">
                    {client.address ?? "—"}
                  </td>
                  <td className="table-td text-gray-500">
                    {formatDate(client.created_at)}
                  </td>
                  <td className="table-td">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-blue-700 hover:underline text-sm font-medium"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  {q
                    ? "Aucun client ne correspond à votre recherche"
                    : "Aucun client enregistré"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
