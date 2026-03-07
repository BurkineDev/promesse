"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Client, Package } from "@/types";

interface PackageFormProps {
  clients: Client[];
  pkg?: Package;
  defaultClientId?: string;
}

export function PackageForm({ clients, pkg, defaultClientId }: PackageFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    client_id: pkg?.client_id ?? defaultClientId ?? "",
    destination: pkg?.destination ?? "",
    origin: pkg?.origin ?? "Montréal",
    description: pkg?.description ?? "",
    weight: pkg?.weight?.toString() ?? "",
    price: pkg?.price?.toString() ?? "",
    notes: pkg?.notes ?? "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      client_id: form.client_id || null,
      destination: form.destination.trim(),
      origin: form.origin.trim(),
      description: form.description.trim() || null,
      weight: form.weight ? parseFloat(form.weight) : null,
      price: form.price ? parseFloat(form.price) : null,
      notes: form.notes.trim() || null,
    };

    if (pkg) {
      // Update existing package
      const { error } = await supabase
        .from("packages")
        .update(payload)
        .eq("id", pkg.id);

      if (error) {
        setError("Erreur lors de la modification : " + error.message);
        setLoading(false);
        return;
      }
      router.push(`/dashboard/packages/${pkg.id}`);
    } else {
      // Generate tracking number and create package
      const { data: trackingData, error: trackingError } = await supabase.rpc(
        "generate_tracking_number"
      );

      if (trackingError) {
        setError("Erreur lors de la génération du numéro de tracking.");
        setLoading(false);
        return;
      }

      const { data: newPkg, error } = await supabase
        .from("packages")
        .insert({ ...payload, tracking_number: trackingData, status: "RECU" })
        .select()
        .single();

      if (error) {
        setError("Erreur lors de la création : " + error.message);
        setLoading(false);
        return;
      }

      // Create initial tracking event
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
    <form onSubmit={handleSubmit} className="card p-6 max-w-2xl space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Client */}
        <div className="sm:col-span-2">
          <label htmlFor="client_id" className="label">
            Client
          </label>
          <select
            id="client_id"
            name="client_id"
            value={form.client_id}
            onChange={handleChange}
            className="input"
          >
            <option value="">— Sélectionner un client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Origin */}
        <div>
          <label htmlFor="origin" className="label">
            Origine <span className="text-red-500">*</span>
          </label>
          <input
            id="origin"
            name="origin"
            type="text"
            required
            value={form.origin}
            onChange={handleChange}
            className="input"
            placeholder="Montréal"
          />
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="destination" className="label">
            Destination <span className="text-red-500">*</span>
          </label>
          <input
            id="destination"
            name="destination"
            type="text"
            required
            value={form.destination}
            onChange={handleChange}
            className="input"
            placeholder="Ouagadougou, Burkina Faso"
          />
        </div>

        {/* Weight */}
        <div>
          <label htmlFor="weight" className="label">
            Poids (kg)
          </label>
          <input
            id="weight"
            name="weight"
            type="number"
            step="0.01"
            min="0"
            value={form.weight}
            onChange={handleChange}
            className="input"
            placeholder="0.00"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="label">
            Prix (CAD)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            className="input"
            placeholder="0.00"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="label">
            Description du contenu
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            className="input resize-none"
            placeholder="Vêtements, électronique, documents..."
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="label">
            Notes internes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            className="input resize-none"
            placeholder="Informations internes..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? "Enregistrement..."
            : pkg
            ? "Modifier le colis"
            : "Créer le colis"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
