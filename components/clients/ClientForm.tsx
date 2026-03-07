"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Client } from "@/types";

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: client?.name ?? "",
    phone: client?.phone ?? "",
    email: client?.email ?? "",
    address: client?.address ?? "",
    notes: client?.notes ?? "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
    };

    if (client) {
      const { error } = await supabase
        .from("clients")
        .update(payload)
        .eq("id", client.id);
      if (error) {
        setError("Erreur lors de la modification : " + error.message);
        setLoading(false);
        return;
      }
      router.push(`/dashboard/clients/${client.id}`);
    } else {
      const { data, error } = await supabase
        .from("clients")
        .insert(payload)
        .select()
        .single();
      if (error) {
        setError("Erreur lors de la création : " + error.message);
        setLoading(false);
        return;
      }
      router.push(`/dashboard/clients/${data.id}`);
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 max-w-2xl space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="label">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="input"
            placeholder="Jean Dupont"
          />
        </div>

        <div>
          <label htmlFor="phone" className="label">
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="input"
            placeholder="+1 514 000 0000"
          />
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="input"
            placeholder="client@email.com"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className="label">
            Adresse
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            className="input"
            placeholder="123 Rue Principale, Montréal, QC"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="label">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="input resize-none"
            placeholder="Informations supplémentaires..."
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
            : client
            ? "Modifier le client"
            : "Créer le client"}
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
