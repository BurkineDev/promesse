"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Package } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"register" | "login">("register");

  const [form, setForm] = useState({
    name: "", phone: "", email: "", password: "", confirmPassword: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, phone: form.phone } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name: form.name,
        phone: form.phone || null,
        role: "client",
      });
    }

    router.push("/portal");
    router.refresh();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password,
    });

    if (error) { setError("Email ou mot de passe incorrect."); setLoading(false); return; }
    router.push("/portal");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
            <Package className="w-8 h-8 text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">La Promesse</h1>
          <p className="text-gray-500 text-sm mt-1">Services Logistiques Canada–Afrique</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {(["register","login"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}>
              {m === "register" ? "Créer un compte" : "Se connecter"}
            </button>
          ))}
        </div>

        <form onSubmit={mode === "register" ? handleRegister : handleLogin} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="label">Nom complet *</label>
                <input name="name" required value={form.name} onChange={handleChange}
                  className="input" placeholder="Jean Dupont" />
              </div>
              <div>
                <label className="label">Téléphone (WhatsApp de préférence)</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="input" placeholder="+1 514-000-0000" />
              </div>
            </>
          )}

          <div>
            <label className="label">Email *</label>
            <input name="email" type="email" required value={form.email} onChange={handleChange}
              className="input" placeholder="vous@email.com" />
          </div>

          <div>
            <label className="label">Mot de passe *</label>
            <input name="password" type="password" required value={form.password} onChange={handleChange}
              className="input" placeholder="••••••••" minLength={6} />
          </div>

          {mode === "register" && (
            <div>
              <label className="label">Confirmer le mot de passe *</label>
              <input name="confirmPassword" type="password" required value={form.confirmPassword}
                onChange={handleChange} className="input" placeholder="••••••••" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? "En cours..." : mode === "register" ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Vous souhaitez uniquement{" "}
          <Link href="/track" className="text-blue-700 font-medium hover:underline">
            suivre un colis ?
          </Link>
        </div>
      </div>
    </div>
  );
}
