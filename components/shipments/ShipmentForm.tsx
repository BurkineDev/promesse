"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Route, DIRECTION_LABELS, TRANSPORT_LABELS, Direction, Transport } from "@/types";

export function ShipmentForm({ routes }: { routes: Route[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", route_id: "", direction: "CA_TO_BF" as Direction,
    transport: "AIR" as Transport, departure_date: "", arrival_date: "", notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleRouteChange(routeId: string) {
    const route = routes.find(r => r.id === routeId);
    setForm(p => ({
      ...p, route_id: routeId,
      direction: route?.direction ?? p.direction,
      transport: route?.transport ?? p.transport,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    const { error } = await supabase.from("shipments").insert({
      name: form.name,
      route_id: form.route_id || null,
      direction: form.direction,
      transport: form.transport,
      departure_date: form.departure_date || null,
      arrival_date: form.arrival_date || null,
      notes: form.notes || null,
      status: "PLANIFIE",
    });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard/shipments");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 max-w-xl space-y-4">
      <div>
        <label className="label">Nom du lot *</label>
        <input name="name" required value={form.name} onChange={handleChange}
          className="input" placeholder="Ex: Départ Montréal → Ouaga — Juin 2026" />
      </div>

      <div>
        <label className="label">Route</label>
        <select name="route_id" value={form.route_id} onChange={e => handleRouteChange(e.target.value)} className="input">
          <option value="">— Sélectionner une route —</option>
          {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Sens</label>
          <select name="direction" value={form.direction} onChange={handleChange} className="input">
            {(["CA_TO_BF","BF_TO_CA"] as Direction[]).map(d =>
              <option key={d} value={d}>{DIRECTION_LABELS[d]}</option>
            )}
          </select>
        </div>
        <div>
          <label className="label">Transport</label>
          <select name="transport" value={form.transport} onChange={handleChange} className="input">
            {(["AIR","SEA","LAND"] as Transport[]).map(t =>
              <option key={t} value={t}>{TRANSPORT_LABELS[t]}</option>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Date de départ</label>
          <input name="departure_date" type="date" value={form.departure_date} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="label">Date d&apos;arrivée estimée</label>
          <input name="arrival_date" type="date" value={form.arrival_date} onChange={handleChange} className="input" />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="input resize-none" />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Création..." : "Créer le lot"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">Annuler</button>
      </div>
    </form>
  );
}
