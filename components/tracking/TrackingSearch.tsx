"use client";

import { useState, useEffect, use } from "react";
import { Search, Package, MapPin, Calendar, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  PackageStatus,
  STATUS_LABELS,
  STATUS_ORDER,
  TrackingEvent,
} from "@/types";
import { formatDateTime } from "@/lib/utils";

const STATUS_ICONS: Record<PackageStatus, string> = {
  RECU: "📦",
  ENTREPOT: "🏭",
  EXPEDIE: "✈️",
  EN_TRANSIT: "🚢",
  ARRIVE: "📍",
  LIVRE: "✅",
};

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
    if (initialTracking) {
      search(initialTracking);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    search(input);
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set("numero", input.trim().toUpperCase());
    window.history.pushState({}, "", url.toString());
  }

  const currentStatusIndex = result
    ? STATUS_ORDER.indexOf(result.package.status)
    : -1;

  return (
    <div>
      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 bg-white rounded-2xl p-2 shadow-2xl mb-8"
      >
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="IMP-2026-0001"
            className="flex-1 text-gray-900 font-mono text-lg outline-none placeholder-gray-300 py-2"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary px-6 py-3 text-base rounded-xl"
        >
          {loading ? "..." : "Rechercher"}
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-center text-white">
          <p className="text-lg">Recherche en cours...</p>
        </div>
      )}

      {/* Not found */}
      {notFound && !loading && (
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-center">
          <Package className="w-12 h-12 text-blue-300 mx-auto mb-3 opacity-50" />
          <p className="text-white font-semibold text-lg mb-1">
            Colis introuvable
          </p>
          <p className="text-blue-200 text-sm">
            Vérifiez le numéro de tracking et réessayez.
            <br />
            Format attendu : IMP-2026-0001
          </p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden text-left">
          {/* Package header */}
          <div className="bg-gray-50 px-6 py-5 border-b border-gray-100">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Numéro de tracking</p>
                <p className="font-mono text-2xl font-bold text-gray-900">
                  {result.package.tracking_number}
                </p>
                {result.package.client_name && (
                  <p className="text-sm text-gray-500 mt-1">
                    Client : {result.package.client_name}
                  </p>
                )}
              </div>
              <StatusBadge status={result.package.status} />
            </div>
          </div>

          {/* Route */}
          <div className="px-6 py-4 flex items-center gap-3 text-sm border-b border-gray-100">
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              {result.package.origin}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300" />
            <div className="flex items-center gap-1 text-gray-900 font-medium">
              <MapPin className="w-4 h-4 text-blue-500" />
              {result.package.destination}
            </div>
            <div className="ml-auto flex items-center gap-1 text-gray-400 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateTime(result.package.created_at)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              {STATUS_ORDER.map((s, idx) => (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 transition-colors ${
                      idx <= currentStatusIndex
                        ? "bg-blue-700 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {STATUS_ICONS[s]}
                  </div>
                  <p
                    className={`text-xs text-center leading-tight ${
                      idx <= currentStatusIndex
                        ? "text-gray-700 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-700 rounded-full transition-all duration-500"
                style={{
                  width: `${((currentStatusIndex + 1) / STATUS_ORDER.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="px-6 py-5">
            <h3 className="font-semibold text-gray-900 mb-4">
              Historique des événements
            </h3>
            {result.events.length > 0 ? (
              <ol className="relative border-l border-gray-200 ml-3 space-y-4">
                {result.events.map((event, idx) => (
                  <li key={event.id} className="ml-6">
                    <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-white rounded-full ring-2 ring-gray-200 text-xs">
                      {STATUS_ICONS[event.status as PackageStatus]}
                    </span>
                    <div className={idx === 0 ? "opacity-100" : "opacity-60"}>
                      <p className="text-sm font-semibold text-gray-900">
                        {STATUS_LABELS[event.status as PackageStatus]}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-500">
                          📍 {event.location}
                        </p>
                      )}
                      {event.notes && (
                        <p className="text-xs text-gray-400 italic">
                          {event.notes}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateTime(event.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-gray-400">Aucun événement disponible</p>
            )}
          </div>

          {result.package.description && (
            <div className="px-6 pb-5">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-600">{result.package.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
