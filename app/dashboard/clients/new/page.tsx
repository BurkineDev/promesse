import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ClientForm } from "@/components/clients/ClientForm";

export const metadata: Metadata = { title: "Nouveau client" };

export default function NewClientPage() {
  return (
    <div>
      <Header title="Nouveau client" subtitle="Enregistrer un nouveau client" />
      <ClientForm />
    </div>
  );
}
