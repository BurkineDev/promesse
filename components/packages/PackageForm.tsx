"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Client, Package } from "@/types";
import { MapPin, Package as PackageIcon } from "lucide-react";

interface PackageFormProps {
  clients: Client[];
  pkg?: Package;
  defaultClientId?: string;
}

// Zones postales Ouagadougou avec tarifs en CAD
const POSTAL_ZONES = [
  { id: "ouaga_centre",    label: "Ouagadougou – Centre-ville",    cost: 2.00 },
  { id: "ouaga_secteur",   label: "Ouagadougou – Secteurs / Zones", cost: 3.50 },
  { id: "ouaga_peripherie",label: "Ouagadougou – Périphérie",       cost: 5.00 },
  { id: "burkina_ville",   label: "Autres villes Burkina Faso",     cost: 8.00 },
  { id: "hors_burkina",    label: "Hors Burkina / International",   cost: 12.00 },
];

export function PackageForm({ clients, pkg, defaultClientId }: PackageFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    client_id:    pkg?.client_id    ?? defaultClientId ?? "",
    destination:  pkg?.destination  ?? "",
    origin:       pkg?.origin       ?? "Montréal",
    description:  pkg?.description  ?? "",
    weight:       pkg?.weight?.toString()  ?? "",
    price:        pkg?.price?.toString()   ?? "",
    notes:        pkg?.notes        ?? "",
    // Livraison postale
    delivery_mode:             (pkg as (Package & { delivery_mode?: string }) | undefined)?.delivery_mode ?? "BUREAU",
    postal_recipient_name:     (pkg as (Package & { postal_recipient_name?: string }) | undefined)?.postal_recipient_name ?? "",
    postal_recipient_phone:    (pkg as (Package & { postal_recipient_phone?: string }) | undefined)?.postal_recipient_phone ?? "",
    postal_recipient_address:  (pkg as (Package & { postal_recipient_address?: string }) | undefined)?.postal_recipient_address ?? "",
    postal_zone:               (pkg as (Package & { postal_zone?: string }) | undefined)?.postal_zone ?? "",
  });

  const selectedZone = POSTAL_ZONES.find(z => z.id === form.postal_zone);
  const postalCost = selectedZone?.cost ?? 0;
  const basePrice = parseFloat(form.price) || 0;
  const totalPrice = form.delivery_mode === "POSTAL" ? basePrice + postalCost : basePrice;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (form.delivery_mode === "POSTAL" && !form.postal_recipient_name.trim()) {
      setError("Le nom du destinataire postal est requis.");
      setLoading(false);
      return;
    }
    if (form.delivery_mode === "POSTAL" && !form.postal_zone) {
      setError("Veuillez sélectionner une zone postale.");
      setLoading(false);
      return;
    }

    const payload = {
      client_id:    form.client_id || null,
      destination:  form.destination.trim(),
      origin:       form.origin.trim(),
      description:  form.description.trim() || null,
      weight:       form.weight ? parseFloat(form.weight) : null,
      price:        totalPrice || null,
      notes:        form.notes.trim() || null,
      delivery_mode: form.delivery_mode,
      postal_recipient_name:    form.delivery_mode === "POSTAL" ? form.postal_recipient_name.trim() || null : null,
      postal_recipient_phone:   form.delivery_mode === "POSTAL" ? form.postal_recipient_phone.trim() || null : null,
      postal_recipient_address: form.delivery_mode === "POSTAL" ? form.postal_recipient_address.trim() || null : null,
      postal_zone:              form.delivery_mode === "POSTAL" ? form.postal_zone || null : null,
      postal_cost:              form.delivery_mode === "POSTAL" ? postalCost : 0,
    };

    if (pkg) {
      const { error } = await supabase.from("packages").update(payload).eq("id", pkg.id);
      if (error) { setError("Erreur lors de la modification : " + error.message); setLoading(false); return; }
      router.push(`/dashboard/packages/${pkg.id}`);
    } else {
      const { data: trackingData, error: trackingError } = await supabase.rpc("generate_tracking_number");
      if (trackingError) { setError("Erreur lors de la génération du numéro de tracking."); setLoading(false); return; }

      const { data: newPkg, error } = await supabase
        .from("packages")
        .insert({ ...payload, tracking_number: trackingData, status: "RECU" })
        .select()
        .single();

      if (error) { setError("Erreur lors de la création : " + error.message); setLoading(false); return; }

      await supabase.from("tracking_events").insert({
        package_id: newPkg.id,
        status: "RECU",
        location: form.origin.trim(),
        notes: "Colis enregistré",
      });

      router.push(`/dashboard/packages/${newPkg.id}`);
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 max-w-2xl space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Client */}
        <div className="sm:col-span-2">
          <label htmlFor="client_id" className="label">Client</label>
          <select id="client_id" name="client_id" value={form.client_id} onChange={handleChange} className="input">
            <option value="">— Sélectionner un client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ""}</option>
            ))}
          </select>
        </div>

        {/* Origin */}
        <div>
          <label htmlFor="origin" className="label">Origine <span className="text-red-500">*</span></label>
          <input id="origin" name="origin" type="text" required value={form.origin} onChange={handleChange} className="input" placeholder="Montréal" />
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="destination" className="label">Destination <span className="text-red-500">*</span></label>
          <input id="destination" name="destination" type="text" required value={form.destination} onChange={handleChange} className="input" placeholder="Ouagadougou, Burkina Faso" />
        </div>

        {/* Weight */}
        <div>
          <label htmlFor="weight" className="label">Poids (kg)</label>
          <input id="weight" name="weight" type="number" step="0.01" min="0" value={form.weight} onChange={handleChange} className="input" placeholder="0.00" />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="label">Prix de base (CAD)</label>
          <input id="price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} className="input" placeholder="0.00" />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="label">Description du contenu</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={2} className="input resize-none" placeholder="Vêtements, électronique, documents..." />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="label">Notes internes</label>
          <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={2} className="input resize-none" placeholder="Informations internes..." />
        </div>
      </div>

      {/* ── MODE DE LIVRAISON ── */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Mode de livraison à destination
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Bureau */}
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, delivery_mode: "BUREAU" }))}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              form.delivery_mode === "BUREAU"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <PackageIcon className="w-6 h-6" />
            <div className="text-center">
              <p className="font-semibold text-sm">Retrait au bureau</p>
              <p className="text-xs opacity-70">Bureau Ouagadougou</p>
            </div>
            {form.delivery_mode === "BUREAU" && (
              <span className="text-xs font-bold text-green-600">Gratuit</span>
            )}
          </button>

          {/* Postal */}
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, delivery_mode: "POSTAL" }))}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              form.delivery_mode === "POSTAL"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <MapPin className="w-6 h-6" />
            <div className="text-center">
              <p className="font-semibold text-sm">Livraison postale</p>
              <p className="text-xs opacity-70">À domicile / adresse</p>
            </div>
            {form.delivery_mode === "POSTAL" && postalCost > 0 && (
              <span className="text-xs font-bold text-blue-600">+{postalCost.toFixed(2)} CAD</span>
            )}
          </button>
        </div>

        {/* Champs postaux */}
        {form.delivery_mode === "POSTAL" && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-4">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Informations du destinataire postal
            </p>

            {/* Zone */}
            <div>
              <label className="label">Zone de livraison <span className="text-red-500">*</span></label>
              <select name="postal_zone" value={form.postal_zone} onChange={handleChange} className="input">
                <option value="">— Sélectionner une zone —</option>
                {POSTAL_ZONES.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.label} — {z.cost.toFixed(2)} CAD
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nom destinataire */}
              <div>
                <label className="label">Nom complet du destinataire <span className="text-red-500">*</span></label>
                <input
                  name="postal_recipient_name"
                  type="text"
                  value={form.postal_recipient_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Prénom Nom"
                />
              </div>

              {/* Téléphone destinataire */}
              <div>
                <label className="label">Téléphone</label>
                <input
                  name="postal_recipient_phone"
                  type="text"
                  value={form.postal_recipient_phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="+226 XX XX XX XX"
                />
              </div>

              {/* Adresse complète */}
              <div className="sm:col-span-2">
                <label className="label">Adresse complète <span className="text-red-500">*</span></label>
                <textarea
                  name="postal_recipient_address"
                  value={form.postal_recipient_address}
                  onChange={handleChange}
                  rows={2}
                  className="input resize-none"
                  placeholder="N° rue, quartier, secteur, ville..."
                />
              </div>
            </div>

            {selectedZone && (
              <div className="bg-white border border-blue-200 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm text-gray-600">Frais postaux ({selectedZone.label})</span>
                <span className="font-bold text-blue-700">{postalCost.toFixed(2)} CAD</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Résumé prix total */}
      {(basePrice > 0 || (form.delivery_mode === "POSTAL" && postalCost > 0)) && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          {basePrice > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Prix de base</span>
              <span>{basePrice.toFixed(2)} CAD</span>
            </div>
          )}
          {form.delivery_mode === "POSTAL" && postalCost > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Frais postaux</span>
              <span>+{postalCost.toFixed(2)} CAD</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
            <span>Total facture</span>
            <span className="text-blue-700">{totalPrice.toFixed(2)} CAD</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Enregistrement..." : pkg ? "Modifier le colis" : "Créer le colis"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Annuler
        </button>
      </div>
    </form>
  );
}
