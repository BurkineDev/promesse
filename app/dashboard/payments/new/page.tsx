import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { PaymentForm } from "@/components/payments/PaymentForm";

export const metadata: Metadata = { title: "Nouveau paiement" };

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ package_id?: string }>;
}) {
  const { package_id } = await searchParams;
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from("packages")
    .select("id, tracking_number, destination, client:clients(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <Header title="Nouveau paiement" subtitle="Enregistrer un paiement" />
      <PaymentForm
        packages={packages ?? []}
        defaultPackageId={package_id}
      />
    </div>
  );
}
