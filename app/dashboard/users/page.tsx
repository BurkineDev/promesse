import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { Header } from "@/components/layout/Header";
import { UserPlus, Shield, User, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Gestion des utilisateurs" };

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  admin:    { label: "Administrateur", color: "bg-purple-100 text-purple-700", icon: Shield },
  agent:    { label: "Agent",          color: "bg-blue-100 text-blue-700",     icon: Briefcase },
  delegate: { label: "Délégué",        color: "bg-teal-100 text-teal-700",     icon: User },
  client:   { label: "Client",         color: "bg-gray-100 text-gray-600",     icon: User },
};

async function createUser(formData: FormData) {
  "use server";
  const name     = formData.get("name") as string;
  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role     = formData.get("role") as string;

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Créer l'utilisateur via l'API admin
  const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !userData.user) {
    console.error("Erreur création user:", createError);
    return;
  }

  // Mettre à jour le profil avec nom et rôle
  await adminClient
    .from("profiles")
    .update({ name, role })
    .eq("id", userData.user.id);

  revalidatePath("/dashboard/users");
}

async function updateRole(formData: FormData) {
  "use server";
  const userId = formData.get("user_id") as string;
  const role   = formData.get("role") as string;

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await adminClient.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/dashboard/users");
}

export default async function UsersPage() {
  const supabase = await createClient();

  // Vérifier que c'est un admin
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") {
    return (
      <div className="card p-8 text-center text-gray-400">
        Accès réservé aux administrateurs.
      </div>
    );
  }

  // Récupérer tous les utilisateurs via la fonction RPC
  const { data: users } = await supabase.rpc("get_all_users");

  return (
    <div>
      <Header
        title="Utilisateurs & Délégués"
        subtitle="Gérer les comptes administrateurs, agents et délégués"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Liste utilisateurs */}
        <div className="lg:col-span-2 space-y-3">
          {users && users.length > 0 ? (
            users.map((u: {
              id: string; name: string; role: string; phone: string;
              email: string; last_sign_in: string; created_at: string;
            }) => {
              const cfg = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.client;
              const Icon = cfg.icon;
              return (
                <div key={u.id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{u.name || "—"}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                    <p className="text-xs text-gray-300 mt-0.5">
                      Créé le {formatDate(u.created_at)}
                      {u.last_sign_in && ` · Dernière connexion ${formatDate(u.last_sign_in)}`}
                    </p>
                  </div>

                  {/* Changer le rôle */}
                  {u.role !== "client" && (
                    <form action={updateRole} className="flex-shrink-0">
                      <input type="hidden" name="user_id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white"
                        onChange={(e) => e.target.form?.requestSubmit()}
                      >
                        <option value="admin">Administrateur</option>
                        <option value="agent">Agent</option>
                        <option value="delegate">Délégué</option>
                      </select>
                    </form>
                  )}
                </div>
              );
            })
          ) : (
            <div className="card p-12 text-center text-gray-400 text-sm">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>

        {/* Formulaire ajout utilisateur */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Ajouter un utilisateur</h2>
            </div>

            <form action={createUser} className="space-y-3">
              <div>
                <label className="label">Nom complet</label>
                <input name="name" type="text" required className="input" placeholder="Prénom Nom" />
              </div>
              <div>
                <label className="label">Email <span className="text-red-500">*</span></label>
                <input name="email" type="email" required className="input" placeholder="email@exemple.com" />
              </div>
              <div>
                <label className="label">Mot de passe <span className="text-red-500">*</span></label>
                <input name="password" type="password" required minLength={8} className="input" placeholder="Min. 8 caractères" />
              </div>
              <div>
                <label className="label">Rôle <span className="text-red-500">*</span></label>
                <select name="role" required className="input">
                  <option value="agent">Agent</option>
                  <option value="delegate">Délégué</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 space-y-1">
                <p><strong>Agent</strong> — Saisie et mise à jour des colis</p>
                <p><strong>Délégué</strong> — Accès lecture + validation</p>
                <p><strong>Admin</strong> — Accès complet</p>
              </div>

              <button type="submit" className="btn-primary w-full">
                Créer le compte
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
