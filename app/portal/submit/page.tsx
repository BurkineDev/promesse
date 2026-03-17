import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SubmitPackageForm } from "@/components/portal/SubmitPackageForm";
import { Route } from "@/types";

export default async function SubmitPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/register");

  const { data: routes } = await supabase
    .from("routes")
    .select("*")
    .eq("is_active", true)
    .order("direction")
    .order("name");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Envoyer un colis</h1>
        <p className="text-gray-500 text-sm mt-1">
          Remplissez le formulaire — nous vous confirmons sous 24h
        </p>
      </div>
      <SubmitPackageForm routes={(routes ?? []) as Route[]} userId={user.id} />
    </div>
  );
}
