"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type View = "login" | "forgot" | "forgot_sent";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError("Impossible d'envoyer l'email. Vérifiez l'adresse saisie.");
      return;
    }
    setView("forgot_sent");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
            <Package className="w-8 h-8 text-blue-700" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PromessTrack</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {view === "login" ? "Connexion à votre espace" : "Réinitialiser le mot de passe"}
          </p>
        </div>

        {/* ── Vue : lien envoyé ── */}
        {view === "forgot_sent" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
              <MailCheck className="w-8 h-8 text-green-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Email envoyé !</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.<br />
              Vérifiez également votre dossier <strong>spam / courrier indésirable</strong>.
            </p>
            <button onClick={() => setView("login")}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
            </button>
          </div>
        )}

        {/* ── Vue : mot de passe oublié ── */}
        {view === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Saisissez votre adresse email — nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            <div>
              <label htmlFor="reset-email" className="label">Adresse email</label>
              <input id="reset-email" type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="input" placeholder="admin@entreprise.com" autoComplete="email" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>

            <button type="button" onClick={() => { setView("login"); setError(null); }}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mx-auto transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
            </button>
          </form>
        )}

        {/* ── Vue : connexion ── */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Adresse email</label>
              <input id="email" type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="input" placeholder="admin@entreprise.com" autoComplete="email" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label !mb-0">Mot de passe</label>
                <button type="button"
                  onClick={() => { setView("forgot"); setError(null); }}
                  className="text-xs text-blue-600 hover:underline font-medium">
                  Mot de passe oublié ?
                </button>
              </div>
              <input id="password" type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                className="input" placeholder="••••••••" autoComplete="current-password" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
        )}

        {view === "login" && (
          <p className="text-center mt-6 text-sm text-gray-500">
            Vous souhaitez suivre un colis ?{" "}
            <a href="/track" className="text-blue-700 font-medium hover:underline">
              Portail de suivi
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
