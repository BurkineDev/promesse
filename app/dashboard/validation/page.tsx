import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { ValidationList } from "@/components/packages/ValidationList";

export const metadata: Metadata = { title: "Validation des demandes" };

export default async function ValidationPage() {
  const supabase = await createClient();

  const { data: pending } = await supabase
    .from("packages")
    .select("*, client:clients(name, phone, email), submitter:profiles!submitted_by(name, phone)")
    .in("status", ["SOUMIS", "EN_ATTENTE_VALIDATION"])
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Validation des demandes</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {pending?.length ?? 0} demande{(pending?.length ?? 0) > 1 ? "s" : ""} en attente
        </p>
      </div>
      <ValidationList packages={pending ?? []} />
    </div>
  );
}
