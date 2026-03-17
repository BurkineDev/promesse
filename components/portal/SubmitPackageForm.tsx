"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Route, CATEGORY_LABELS, PackageCategory, DIRECTION_LABELS, Direction, estimatePrice,
} from "@/types";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [PackageCategory, string][];

interface SubmitPackageFormProps {
  routes: Route[];
  userId: string;
}

export function SubmitPackageForm({ routes, userId }: SubmitPackageFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const [form, setForm] = useState({
    route_id: "",
    category: "DIVERS" as PackageCategory,
    description: "",
    weight: "",
    length_cm: "", width_cm: "", height_cm: "",
    declared_value: "",
    is_urgent: false,
    origin: "Montréal, Canada",
    destination: "",
    notes: "",
  });

  const selectedRoute = routes.find(r => r.id === form.route_id);
  const estimate = selectedRoute && form.weight
    ? estimatePrice(parseFloat(form.weight), selectedRoute, form.is_urgent)
    : null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(p => ({
      ...p,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleRouteChange(routeId: string) {
    const route = routes.find(r => r.id === routeId);
    setForm(p => ({
      ...p,
      route_id: routeId,
      origin: route?.origin ?? p.origin,
      destination: route?.destination ?? p.destination,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.destination) return;
    setError(null);
    setLoading(true);

    const { data: trackingData } = await supabase.rpc("generate_tracking_number");

    const { data: pkg, error: pkgError } = await supabase
      .from("packages")
      .insert({
        tracking_number: trackingData,
        status: "SOUMIS",
        submitted_by: userId,
        category: form.category,
        description: form.description,
        weight: form.weight ? parseFloat(form.weight) : null,
        length_cm: form.length_cm ? parseFloat(form.length_cm) : null,
        width_cm: form.width_cm ? parseFloat(form.width_cm) : null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        declared_value: form.declared_value ? parseFloat(form.declared_value) : null,
        origin: form.origin,
        destination: form.destination,
        direction: selectedRoute?.direction ?? "CA_TO_BF",
        is_urgent: form.is_urgent,
        estimated_price: estimate,
        notes: form.notes || null,
      })
      .select()
      .single();

    if (pkgError) {
      setError("Erreur lors de la soumission : " + pkgError.message);
      setLoading(false);
      return;
    }

    await supabase.from("tracking_events").insert({
      package_id: pkg.id,
      status: "SOUMIS",
      location: form.origin,
      notes: "Demande soumise par le client",
    });

    setSubmitted(pkg.tracking_number);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="card p-8 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-bold text-gray-900">Demande envoyée !</h2>
        <p className="text-gray-500">
          Votre demande a été reçue. Nous vous confirmons sous 24h.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-1">Numéro de suivi</p>
          <p className="font-mono text-2xl font-bold text-blue-700">{submitted}</p>
        </div>
        <p className="text-sm text-gray-500">
          Gardez ce numéro pour suivre votre colis sur{" "}
          <a href={`/track?numero=${submitted}`} className="text-blue-700 underline">
            notre portail
          </a>
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button onClick={() => { setSubmitted(null); setForm({ route_id:"", category:"DIVERS", description:"", weight:"", length_cm:"", width_cm:"", height_cm:"", declared_value:"", is_urgent:false, origin:"Montréal, Canada", destination:"", notes:"" }); }}
            className="btn-secondary">Nouveau colis</button>
          <a href="/portal" className="btn-primary">Mes colis</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Route */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Trajet</h2>

        <div>
          <label className="label">Route d&apos;expédition *</label>
          <select name="route_id" required value={form.route_id}
            onChange={e => handleRouteChange(e.target.value)} className="input">
            <option value="">— Choisir une route —</option>
            {(["CA_TO_BF","BF_TO_CA"] as Direction[]).map(dir => (
              <optgroup key={dir} label={DIRECTION_LABELS[dir]}>
                {routes.filter(r => r.direction === dir).map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.transport === "AIR" ? "✈️" : r.transport === "SEA" ? "🚢" : "🚛"}
                    {r.duration_days ? ` ~${r.duration_days}j` : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {selectedRoute && (
          <div className="bg-blue-50 rounded-xl p-3 text-sm flex justify-between">
            <span className="text-gray-600">{selectedRoute.origin} → {selectedRoute.destination}</span>
            <span className="text-blue-700 font-medium">~{selectedRoute.duration_days} jours</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input type="checkbox" id="is_urgent" name="is_urgent"
            checked={form.is_urgent} onChange={handleChange}
            className="w-4 h-4 accent-orange-500" />
          <label htmlFor="is_urgent" className="text-sm text-gray-700 cursor-pointer">
            🚀 Envoi urgent <span className="text-gray-400">(+20%)</span>
          </label>
        </div>
      </div>

      {/* Package details */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Détails du colis</h2>

        <div>
          <label className="label">Catégorie</label>
          <select name="category" value={form.category} onChange={handleChange} className="input">
            {CATEGORIES.map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Description du contenu *</label>
          <textarea name="description" required value={form.description} onChange={handleChange}
            rows={2} className="input resize-none"
            placeholder="Ex: vêtements adultes, chaussures taille 42, médicaments..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Poids estimé (kg)</label>
            <input name="weight" type="number" step="0.1" min="0"
              value={form.weight} onChange={handleChange} className="input" placeholder="5.0" />
          </div>
          <div>
            <label className="label">Valeur déclarée (CAD)</label>
            <input name="declared_value" type="number" step="0.01" min="0"
              value={form.declared_value} onChange={handleChange} className="input" placeholder="100" />
          </div>
        </div>

        <div>
          <label className="label">Dimensions (cm) — optionnel</label>
          <div className="grid grid-cols-3 gap-2">
            {["length_cm","width_cm","height_cm"].map((f,i) => (
              <input key={f} name={f} type="number" step="0.1" min="0"
                value={form[f as keyof typeof form] as string}
                onChange={handleChange} className="input text-sm"
                placeholder={["L","l","H"][i]} />
            ))}
          </div>
        </div>

        <div>
          <label className="label">Notes supplémentaires</label>
          <textarea name="notes" value={form.notes} onChange={handleChange}
            rows={2} className="input resize-none" placeholder="Instructions particulières..." />
        </div>
      </div>

      {/* Estimation */}
      {estimate !== null && (
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-5 text-white">
          <p className="text-blue-200 text-sm">Estimation tarifaire</p>
          <p className="text-4xl font-bold mt-1">{formatCurrency(estimate)}</p>
          <p className="text-blue-200 text-xs mt-1">
            Base {formatCurrency(selectedRoute!.base_price)} + {form.weight}kg × {formatCurrency(selectedRoute!.price_per_kg)}/kg
            {form.is_urgent ? " + 20% urgent" : ""}
          </p>
          <p className="text-blue-100 text-xs mt-2">
            ⚠️ Estimation non contractuelle — prix final confirmé par notre équipe
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
        {loading ? "Envoi en cours..." : "📦 Soumettre ma demande"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        En soumettant, vous acceptez que notre équipe vous contacte pour confirmer les détails.
      </p>
    </form>
  );
}
