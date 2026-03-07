import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import {
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PackageStatus } from "@/types";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const [statsResult, recentPackagesResult, recentPaymentsResult] =
    await Promise.all([
      supabase.rpc("get_dashboard_stats"),
      supabase
        .from("packages")
        .select("*, client:clients(name)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("payments")
        .select("*, package:packages(tracking_number)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const stats = statsResult.data;
  const recentPackages = recentPackagesResult.data ?? [];
  const recentPayments = recentPaymentsResult.data ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Vue d&apos;ensemble de l&apos;activité
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Colis aujourd'hui"
          value={stats?.packages_today ?? 0}
          icon={Package}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="En transit"
          value={stats?.packages_in_transit ?? 0}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatsCard
          title="Livrés (total)"
          value={stats?.packages_delivered ?? 0}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Revenus confirmés"
          value={formatCurrency(stats?.revenue_total ?? 0)}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
          subtitle={`${formatCurrency(stats?.revenue_pending ?? 0)} en attente`}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Total colis"
          value={stats?.packages_total ?? 0}
          icon={Package}
          iconColor="text-gray-600"
          iconBg="bg-gray-100"
        />
        <StatsCard
          title="Clients actifs"
          value={stats?.clients_total ?? 0}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
        />
        <StatsCard
          title="Paiements en attente"
          value={formatCurrency(stats?.revenue_pending ?? 0)}
          icon={Clock}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Packages */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Derniers colis</h2>
            <Link
              href="/dashboard/packages"
              className="text-sm text-blue-700 hover:underline"
            >
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPackages.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-400 text-sm">
                Aucun colis enregistré
              </p>
            ) : (
              recentPackages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/dashboard/packages/${pkg.id}`}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-mono font-semibold text-gray-900">
                      {pkg.tracking_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(pkg.client as { name: string } | null)?.name ?? "Client inconnu"} → {pkg.destination}
                    </p>
                  </div>
                  <StatusBadge status={pkg.status as PackageStatus} size="sm" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Derniers paiements</h2>
            <Link
              href="/dashboard/payments"
              className="text-sm text-blue-700 hover:underline"
            >
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPayments.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-400 text-sm">
                Aucun paiement enregistré
              </p>
            ) : (
              recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <p className="text-sm font-mono font-semibold text-gray-900">
                      {(payment.package as { tracking_number: string } | null)
                        ?.tracking_number ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(payment.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </p>
                    <span
                      className={`text-xs font-medium ${
                        payment.status === "PAYE"
                          ? "text-green-600"
                          : payment.status === "REMBOURSE"
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    >
                      {payment.status === "PAYE"
                        ? "Payé"
                        : payment.status === "REMBOURSE"
                        ? "Remboursé"
                        : "En attente"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
