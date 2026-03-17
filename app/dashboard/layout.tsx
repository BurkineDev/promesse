import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "agent"].includes(profile.role)) {
    redirect("/auth/login");
  }

  const { count: pendingCount } = await supabase
    .from("packages")
    .select("id", { count: "exact", head: true })
    .in("status", ["SOUMIS", "EN_ATTENTE_VALIDATION"]);

  return (
    <DashboardShell pendingCount={pendingCount ?? 0}>
      {children}
    </DashboardShell>
  );
}
