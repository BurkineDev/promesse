"use client";

import { useState, useEffect, use } from "react";
import { Search, Package, MapPin, Calendar, ArrowRight, Clock } from "lucide-react";
import {
  PackageStatus,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_ICONS as GLOBAL_STATUS_ICONS,
  TrackingEvent,
} from "@/types";
import { formatDateTime } from "@/lib/utils";

interface TrackingResult {
  package: {
    id: string;
    tracking_number: string;
    description: string | null;
    weight: number | null;
    destination: string;
    origin: string;
    status: PackageStatus;
    created_at: string;
    client_name: string | null;
  };
  events: TrackingEvent[];
}

interface TrackingSearchProps {
  searchParams: Promise<{ numero?: string }>;
}

const STATUS_BG: Partial<Record<PackageStatus, string>> = {
  SOUMIS:                "bg-slate-500/20 text-slate-300",
  EN_ATTENTE_VALIDATION: "bg-yellow-500/20 text-yellow-300",
  RECU:                  "bg-gray-500/20 text-gray-300",
  EN_PREPARATION:        "bg-amber-500/20 text-amber-300",
  PRET_DEPART:           "bg-cyan-500/20 text-cyan-300",
  EXPEDIE:               "bg-blue-500/20 text-blue-300",
  EN_TRANSIT:            "bg-violet-500/20 text-violet-300",
  EN_COURS_LIVRAISON:    "bg-indigo-500/20 text-indigo-300",
  ARRIVE:                "bg-orange-500/20 text-orange-300",
  LIVRE:                 "bg-green-500/20 text-green-300",
  INCIDENT:              "bg-red-500/20 text-red-300",
  ANNULE:                "bg-gray-500/20 text-gray-500",
};

export function TrackingSearch({ searchParams }: TrackingSearchProps) {
  const resolvedParams = use(searchParams);
  const initialTracking = resolvedParams.numero ?? "";

  const [input, setInput] = useState(initialTracking);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function search(trackingNumber: string) {
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);

    const res = await fetch(
      `/api/tracking?numero=${encodeURIComponent(trackingNumber.trim().toUpperCase())}`
    );

    if (!res.ok) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  useEffect(() => {
    if (initialTracking) search(initialTracking);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    search(input);
    const url = new URL(window.location.href);
    url.searchParams.set("numero", input.trim().toUpperCase());
    window.history.pushState({}, "", url.toString());
  }

  const currentStatusIndex = result
    ? STATUS_ORDER.indexOf(result.package.status)
    : -1;

  /* ── Search bar ── */
  const searchBar = (
    <form onSubmit={handleSubmit}
      className="flex gap-2 glass rounded-2xl p-2 shadow-2xl border border-white/10 mb-6">
      <div className="flex-1 flex items-center gap-2.5 px-3">
        <Search className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="IMP-2026-0001"
          className="flex-1 bg-transparent text-white placeholder-blue-400/40 font-mono text-base outline-none py-2.5"
          autoFocus
        />
      </div>
      <button type="submit" disabled={loading || !input.trim()}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm">
        {loading ? "..." : "Rechercher"}
      </button>
    </form>
  );

  /* ── Loading ── */
  if (loading) return (
    <div>
      {searchBar}
      <div className="glass rounded-2xl p-12 text-center border border-white/10">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-blue-300">Recherche en cours...</p>
      </div>
    </div>
  );

  /* ── Not found ── */
  if (notFound) return (
    <div>
      {searchBar}
      <div className="glass rounded-2xl p-12 text-center border border-white/10">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-white font-bold text-lg mb-2">Colis introuvable</p>
        <p className="text-blue-300/60 text-sm">
          Vérifiez le numéro de tracking et réessayez.<br />
          Format attendu : <span className="font-mono text-blue-400">IMP-2026-0001</span>
        </p>
      </div>
    </div>
  );

  /* ── Result ── */
  if (result) {
    const pkg = result.package;
    const statusBg = STATUS_BG[pkg.status] ?? "bg-blue-500/20 text-blue-300";

    return (
      <div>
        {searchBar}

        {/* Package header card */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden mb-4">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <p className="text-blue-400/60 text-xs uppercase tracking-widest mb-1">Numéro de tracking</p>
                <p className="font-mono text-2xl font-extrabold">{pkg.tracking_number}</p>
                {pkg.client_name && (
                  <p className="text-blue-300/60 text-sm mt-1">Client : {pkg.client_name}</p>
                )}
              </div>
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${statusBg}`}>
                {GLOBAL_STATUS_ICONS[pkg.status]} {STATUS_LABELS[pkg.status]}
              </span>
            </div>

            {/* Route */}
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <div className="flex items-center gap-1.5 text-blue-300/60">
                <MapPin className="w-3.5 h-3.5" /> {pkg.origin}
              </div>
              <ArrowRight className="w-4 h-4 text-blue-500/40" />
              <div className="flex items-center gap-1.5 text-white font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> {pkg.destination}
              </div>
              <div className="ml-auto flex items-center gap-1 text-blue-400/40 text-xs">
                <Calendar className="w-3 h-3" /> {formatDateTime(pkg.created_at)}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-end justify-between mb-3 gap-1">
              {STATUS_ORDER.map((s, idx) => {
                const done = idx <= currentStatusIndex;
                return (
                  <div key={s} className="flex flex-col items-center flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1.5 transition-all ${
                      done ? "bg-blue-600 shadow-lg shadow-blue-900/50" : "bg-white/5"
                    }`}>
                      {GLOBAL_STATUS_ICONS[s]}
                    </div>
                    <p className={`text-[9px] text-center leading-tight line-clamp-2 ${
                      done ? "text-blue-200 font-medium" : "text-white/20"
                    }`}>
                      {STATUS_LABELS[s]}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700"
                style={{ width: `${((currentStatusIndex + 1) / STATUS_ORDER.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="p-5">
            <p className="font-semibold text-sm text-white/70 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Historique
            </p>
            {result.events.length > 0 ? (
              <ol className="relative border-l border-white/10 ml-3 space-y-4">
                {result.events.map((event, idx) => (
                  <li key={event.id} className="ml-6">
                    <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-[#04091a] rounded-full ring-2 ring-white/10 text-xs">
                      {GLOBAL_STATUS_ICONS[event.status as PackageStatus]}
                    </span>
                    <div className={idx === 0 ? "opacity-100" : "opacity-50"}>
                      <p className="text-sm font-semibold">
                        {STATUS_LABELS[event.status as PackageStatus]}
                      </p>
                      {event.location && (
                        <p className="text-xs text-blue-400/60 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </p>
                      )}
                      {event.notes && (
                        <p className="text-xs text-blue-300/40 italic mt-0.5">{event.notes}</p>
                      )}
                      <p className="text-xs text-blue-400/40 mt-1">
                        {formatDateTime(event.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-blue-400/40">Aucun événement disponible</p>
            )}
          </div>

          {pkg.description && (
            <div className="px-5 pb-5 pt-0 border-t border-white/10">
              <p className="text-xs text-blue-400/50 mb-1 mt-4">Description</p>
              <p className="text-sm text-blue-100/80">{pkg.description}</p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="glass rounded-2xl border border-white/10 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-semibold">Vous souhaitez envoyer un colis ?</p>
              <p className="text-xs text-blue-300/50">Collecte à domicile disponible</p>
            </div>
          </div>
          <a href="/portal/register"
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all">
            Commencer →
          </a>
        </div>
      </div>
    );
  }

  /* ── Default (no search yet) ── */
  return (
    <div>
      {searchBar}
      <div className="grid grid-cols-3 gap-3 mt-2">
        {[
          { icon: "🇧🇫", label: "Ouagadougou" },
          { icon: "🇲🇱", label: "Bamako" },
          { icon: "🇸🇳", label: "Dakar" },
        ].map((d) => (
          <div key={d.label} className="glass rounded-xl p-3 text-center border border-white/5">
            <div className="text-2xl mb-1">{d.icon}</div>
            <p className="text-xs text-blue-300/60">{d.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
