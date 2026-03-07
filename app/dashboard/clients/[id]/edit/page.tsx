import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ClientForm } from "@/components/clients/ClientForm";
import { Client } from "@/types";

export const metadata: Metadata = { title: "Modifier le client" };

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  return (
    <div>
      <Header
        title="Modifier le client"
        subtitle={`Modification de ${client.name}`}
      />
      <ClientForm client={client as Client} />
    </div>
  );
}
