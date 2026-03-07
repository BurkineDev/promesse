"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PackageStatus, STATUS_LABELS, STATUS_ORDER } from "@/types";

interface StatusUpdateFormProps {
  packageId: string;
  currentStatus: PackageStatus;
  clientEmail?: string | null;
  clientName?: string | null;
  trackingNumber: string;
  destination: string;
}

export function StatusUpdateForm({
  packageId,
  currentStatus,
  trackingNumber,
}: StatusUpdateFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    status: currentStatus,
    location: "",
    notes: "",
  });

  const availableStatuses = STATUS_ORDER.filter((s) => s !== currentStatus);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.status === currentStatus) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    // Update package status
    const { error: pkgError } = await supabase
      .from("packages")
      .update({ status: form.status })
      .eq("id", packageId);

    if (pkgError) {
      setError("Erreur lors de la mise à jour : " + pkgError.message);
      setLoading(false);
      return;
    }

    // Insert tracking event
    await supabase.from("tracking_events").insert({
      package_id: packageId,
      status: form.status,
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
    });

    // Trigger email notification via API
    if (form.status !== currentStatus) {
      await fetch(`/api/packages/${packageId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: form.status, location: form.location }),
      }).catch(() => {
        // Non-critical: notification failure doesn't block status update
      });
    }

    setSuccess(
      `Statut mis à jour : ${STATUS_LABELS[form.status as PackageStatus]}`
    );
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Mettre à jour le statut</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label">Nouveau statut</label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm((p) => ({ ...p, status: e.target.value as PackageStatus }))
            }
            className="input"
          >
            <option value={currentStatus} disabled>
              Actuel : {STATUS_LABELS[currentStatus]}
            </option>
            {availableStatuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Localisation</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) =>
              setForm((p) => ({ ...p, location: e.target.value }))
            }
            className="input"
            placeholder="ex: Montréal, Aéroport CDG, Ouagadougou..."
          />
        </div>

        <div>
          <label className="label">Note</label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) =>
              setForm((p) => ({ ...p, notes: e.target.value }))
            }
            className="input"
            placeholder="Observation optionnelle..."
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || form.status === currentStatus}
          className="btn-primary w-full"
        >
          {loading ? "Mise à jour..." : "Confirmer le statut"}
        </button>
      </form>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Tracking : <span className="font-mono">{trackingNumber}</span>
      </p>
    </div>
  );
}
