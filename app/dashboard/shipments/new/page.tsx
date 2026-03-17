import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ShipmentForm } from "@/components/shipments/ShipmentForm";

export const metadata: Metadata = { title: "Nouveau lot" };

export default async function NewShipmentPage() {
  const supabase = await createClient();
  const { data: routes } = await supabase.from("routes").select("*").eq("is_active", true).order("name");
  return (
    <div>
      <Header title="Nouveau lot d'expédition" subtitle="Créer un départ groupé" />
      <ShipmentForm routes={routes ?? []} />
    </div>
  );
}
