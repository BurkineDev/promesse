import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { PackageForm } from "@/components/packages/PackageForm";
import { Client, Package } from "@/types";

export const metadata: Metadata = { title: "Modifier le colis" };

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: pkg }, { data: clients }] = await Promise.all([
    supabase.from("packages").select("*").eq("id", id).single(),
    supabase.from("clients").select("*").order("name"),
  ]);

  if (!pkg) notFound();

  return (
    <div>
      <Header
        title="Modifier le colis"
        subtitle={`Modification de ${pkg.tracking_number}`}
      />
      <PackageForm
        pkg={pkg as Package}
        clients={(clients ?? []) as Client[]}
      />
    </div>
  );
}
