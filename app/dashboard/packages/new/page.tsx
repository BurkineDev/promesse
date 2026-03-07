import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { PackageForm } from "@/components/packages/PackageForm";
import { Client } from "@/types";

export const metadata: Metadata = { title: "Nouveau colis" };

export default async function NewPackagePage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>;
}) {
  const { client_id } = await searchParams;
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  return (
    <div>
      <Header
        title="Nouveau colis"
        subtitle="Enregistrer un nouveau colis et générer le numéro de tracking"
      />
      <PackageForm
        clients={(clients ?? []) as Client[]}
        defaultClientId={client_id}
      />
    </div>
  );
}
