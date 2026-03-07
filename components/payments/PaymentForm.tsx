"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Package, PaymentMethod, PaymentStatus, PAYMENT_METHOD_LABELS } from "@/types";

interface PackageWithClient extends Omit<Package, "client"> {
  client: { name: string } | null;
}

interface PaymentFormProps {
  packages: PackageWithClient[];
  defaultPackageId?: string;
}

export function PaymentForm({ packages, defaultPackageId }: PaymentFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    package_id: defaultPackageId ?? "",
    amount: "",
    method: "CASH" as PaymentMethod,
    status: "PAYE" as PaymentStatus,
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.package_id || !form.amount) return;

    setError(null);
    setLoading(true);

    const { error } = await supabase.from("payments").insert({
      package_id: form.package_id,
      amount: parseFloat(form.amount),
      method: form.method,
      status: form.status,
      notes: form.notes.trim() || null,
    });

    if (error) {
      setError("Erreur lors de l'enregistrement : " + error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/payments");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 max-w-xl space-y-4">
      <div>
        <label className="label">
          Colis <span className="text-red-500">*</span>
        </label>
        <select
          name="package_id"
          required
          value={form.package_id}
          onChange={handleChange}
          className="input"
        >
          <option value="">— Sélectionner un colis —</option>
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.tracking_number} — {pkg.destination}
              {pkg.client ? ` (${pkg.client.name})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">
            Montant (CAD) <span className="text-red-500">*</span>
          </label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            value={form.amount}
            onChange={handleChange}
            className="input"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="label">Méthode de paiement</label>
          <select
            name="method"
            value={form.method}
            onChange={handleChange}
            className="input"
          >
            {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Statut du paiement</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="input"
        >
          <option value="PAYE">Payé</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="REMBOURSE">Remboursé</option>
        </select>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          className="input resize-none"
          placeholder="Référence, numéro de transaction..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Enregistrement..." : "Enregistrer le paiement"}
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
