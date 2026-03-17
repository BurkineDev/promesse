"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Route, CATEGORY_LABELS, PackageCategory, DIRECTION_LABELS, Direction, estimatePrice,
} from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Building2, Home, ChevronRight, Clock } from "lucide-react";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [PackageCategory, string][];

type PickupMethod = "DROP_OFF" | "HOME_PICKUP";

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
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>("DROP_OFF");

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

  const [pickup, setPickup] = useState({
    address: "",
    city: "Montréal",
    postal: "",
    date: "",
    time_slot: "MATIN",
    instructions: "",
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

  function handlePickupChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setPickup(p => ({ ...p, [name]: value }));
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

  function buildNotes(): string {
    const parts: string[] = [];
    if (pickupMethod === "HOME_PICKUP") {
      const slotLabel: Record<string, string> = {
        MATIN: "Matin (8h–12h)",
        APRES_MIDI: "Après-midi (12h–17h)",
        SOIR: "Soir (17h–20h)",
      };
      parts.push(
        "═══ COLLECTE À DOMICILE ═══",
        `Adresse : ${pickup.address}, ${pickup.city} ${pickup.postal}`,
        `Date souhaitée : ${pickup.date}`,
        `Créneau : ${slotLabel[pickup.time_slot] ?? pickup.time_slot}`,
      );
      if (pickup.instructions) parts.push(`Instructions : ${pickup.instructions}`);
      parts.push("══════════════════════════");
    }
    if (form.notes.trim()) parts.push(form.notes.trim());
    return parts.join("\n");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.destination) return;
    if (pickupMethod === "HOME_PICKUP" && (!pickup.address || !pickup.date)) {
      setError("Veuillez renseigner l'adresse et la date de collecte.");
      return;
    }
    setError(null);
    setLoading(true);

    const { data: trackingData } = await supabase.rpc("generate_tracking_number");

    const finalNotes = buildNotes();

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
        notes: finalNotes || null,
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
      location: pickupMethod === "HOME_PICKUP" ? `${pickup.address}, ${pickup.city}` : form.origin,
      notes: pickupMethod === "HOME_PICKUP"
        ? `Collecte domicile demandée — ${pickup.address}, ${pickup.city} ${pickup.postal}`
        : "Demande soumise par le client",
    });

    setSubmitted(pkg.tracking_number);
    setLoading(false);
    router.refresh();
  }

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="card p-8 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-bold text-gray-900">Demande envoyée !</h2>
        <p className="text-gray-500 text-sm">
          {pickupMethod === "HOME_PICKUP"
            ? "Notre agent vous contactera pour confirmer le rendez-vous de collecte."
            : "Vous pouvez maintenant apporter votre colis en agence. Nous vous confirmons sous 24h."}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-1">Numéro de suivi</p>
          <p className="font-mono text-2xl font-bold text-blue-700">{submitted}</p>
        </div>
        <p className="text-sm text-gray-500">
          Gardez ce numéro pour suivre votre colis sur{" "}
          <a href={`/track?numero=${submitted}`} className="text-blue-700 underline">notre portail</a>.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => {
              setSubmitted(null);
              setForm({ route_id:"", category:"DIVERS", description:"", weight:"", length_cm:"", width_cm:"", height_cm:"", declared_value:"", is_urgent:false, origin:"Montréal, Canada", destination:"", notes:"" });
              setPickup({ address:"", city:"Montréal", postal:"", date:"", time_slot:"MATIN", instructions:"" });
              setPickupMethod("DROP_OFF");
            }}
            className="btn-secondary"
          >
            Nouveau colis
          </button>
          <a href="/portal/mes-colis" className="btn-primary">Voir mes colis</a>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── 1. Trajet ── */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
          Trajet
        </h2>

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
          <div className="bg-blue-50 rounded-xl p-3 text-sm flex justify-between items-center">
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

      {/* ── 2. Mode de collecte ── */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
          Comment nous remettre votre colis ?
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Drop off */}
          <button
            type="button"
            onClick={() => setPickupMethod("DROP_OFF")}
            className={`relative rounded-xl border-2 p-4 text-left transition-all ${
              pickupMethod === "DROP_OFF"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {pickupMethod === "DROP_OFF" && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <ChevronRight className="w-3 h-3 text-white" />
              </span>
            )}
            <Building2 className={`w-6 h-6 mb-2 ${pickupMethod === "DROP_OFF" ? "text-blue-600" : "text-gray-400"}`} />
            <p className={`font-semibold text-sm ${pickupMethod === "DROP_OFF" ? "text-blue-700" : "text-gray-700"}`}>
              Je dépose à l&apos;agence
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Gratuit · Montréal</p>
          </button>

          {/* Home pickup */}
          <button
            type="button"
            onClick={() => setPickupMethod("HOME_PICKUP")}
            className={`relative rounded-xl border-2 p-4 text-left transition-all ${
              pickupMethod === "HOME_PICKUP"
                ? "border-amber-500 bg-amber-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {pickupMethod === "HOME_PICKUP" && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                <ChevronRight className="w-3 h-3 text-white" />
              </span>
            )}
            <Home className={`w-6 h-6 mb-2 ${pickupMethod === "HOME_PICKUP" ? "text-amber-600" : "text-gray-400"}`} />
            <p className={`font-semibold text-sm ${pickupMethod === "HOME_PICKUP" ? "text-amber-700" : "text-gray-700"}`}>
              Collecte à domicile
            </p>
            <p className="text-xs text-gray-400 mt-0.5">On vient chez vous</p>
          </button>
        </div>

        {/* Home pickup fields */}
        {pickupMethod === "HOME_PICKUP" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" /> Informations de collecte
            </p>

            <div>
              <label className="label">Adresse complète *</label>
              <input name="address" required={pickupMethod === "HOME_PICKUP"}
                value={pickup.address} onChange={handlePickupChange}
                className="input" placeholder="123 Rue Sainte-Catherine O, apt 4" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Ville *</label>
                <input name="city" value={pickup.city} onChange={handlePickupChange}
                  className="input" placeholder="Montréal" />
              </div>
              <div>
                <label className="label">Code postal *</label>
                <input name="postal" value={pickup.postal} onChange={handlePickupChange}
                  className="input" placeholder="H2X 1Y4" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date souhaitée *</label>
                <input name="date" type="date" required={pickupMethod === "HOME_PICKUP"}
                  value={pickup.date} onChange={handlePickupChange}
                  className="input"
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} />
              </div>
              <div>
                <label className="label">Créneau horaire</label>
                <select name="time_slot" value={pickup.time_slot} onChange={handlePickupChange} className="input">
                  <option value="MATIN">🌅 Matin (8h–12h)</option>
                  <option value="APRES_MIDI">☀️ Après-midi (12h–17h)</option>
                  <option value="SOIR">🌆 Soir (17h–20h)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Instructions pour le livreur
              </label>
              <textarea name="instructions" value={pickup.instructions} onChange={handlePickupChange}
                rows={2} className="input resize-none"
                placeholder="Code d'accès, interphone, étage, chien dans l'appartement, etc." />
            </div>

            <div className="flex items-start gap-2 bg-white rounded-lg p-3 border border-amber-200">
              <span className="text-lg flex-shrink-0">ℹ️</span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Notre agent vous contactera par WhatsApp pour confirmer le rendez-vous.
                La collecte est disponible à Montréal et dans les environs.
              </p>
            </div>
          </div>
        )}

        {pickupMethod === "DROP_OFF" && (
          <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
            <span className="text-lg">🏢</span>
            <div>
              <p className="text-sm font-semibold text-blue-800">Adresse de l&apos;agence</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Contactez-nous sur WhatsApp pour l&apos;adresse exacte et les horaires d&apos;ouverture.
              </p>
              <a href="https://wa.me/14399782990" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-700 font-medium mt-1.5 hover:underline">
                💬 +1 439 978-2990
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Détails du colis ── */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
          Détails du colis
        </h2>

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
                placeholder={["Longueur","Largeur","Hauteur"][i]} />
            ))}
          </div>
        </div>

        <div>
          <label className="label">Notes supplémentaires</label>
          <textarea name="notes" value={form.notes} onChange={handleChange}
            rows={2} className="input resize-none" placeholder="Instructions particulières pour votre colis..." />
        </div>
      </div>

      {/* ── Estimation tarifaire ── */}
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
        {loading ? "Envoi en cours..." : pickupMethod === "HOME_PICKUP" ? "🚚 Demander une collecte à domicile" : "📦 Soumettre ma demande"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        En soumettant, vous acceptez que notre équipe vous contacte pour confirmer les détails.
      </p>
    </form>
  );
}
