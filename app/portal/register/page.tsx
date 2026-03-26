"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Package, ArrowLeft, Eye, EyeOff, Check, MailCheck, AlertCircle } from "lucide-react";

const BG_IMG = "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1920&q=80";

type Mode = "register" | "login" | "forgot" | "forgot_sent";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("register");
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", password: "", confirmPassword: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
  }

  const passwordMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;
  const passwordLong  = form.password.length >= 6;

  /* ── Inscription ── */
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

    // Si session = null → confirmation email requise
    if (!data.session) {
      setRegisteredEmail(form.email);
      setLoading(false);
      return;
    }

    // Session immédiate (confirmation email désactivée)
    router.push("/portal");
    router.refresh();
  }

  /* ── Connexion ── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password,
    });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    // Redirection selon le rôle
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "admin" || profile?.role === "agent") {
        router.push("/dashboard");
        router.refresh();
        return;
      }
    }

    router.push("/portal");
    router.refresh();
  }

  /* ── Mot de passe oublié ── */
  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError("Impossible d'envoyer l'email. Vérifiez l'adresse saisie.");
      return;
    }
    switchMode("forgot_sent");
  }

  /* ════════════════════════════════════════
     LAYOUT PARTAGÉ
  ════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex">

      {/* ── Panneau gauche — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#04091a] flex-col justify-between p-10 overflow-hidden">
        <div className="absolute inset-0">
          <Image src={BG_IMG} alt="Entrepôt logistique" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04091a] via-[#04091a]/70 to-[#04091a]/50" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-2">
              <Package className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-bold text-white">La Promesse</p>
              <p className="text-blue-400 text-xs">Canada → Afrique</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Connectez vos proches<br />
              <span className="text-blue-400">en toute simplicité</span>
            </h2>
            <p className="text-blue-300/60 text-lg leading-relaxed max-w-md">
              Envoyez vos colis du Canada vers le Burkina Faso, le Mali, le Sénégal
              et la Côte d&apos;Ivoire avec un suivi en temps réel.
            </p>
          </div>
          <div className="flex gap-6">
            {[
              { value: "2 400+", label: "Colis livrés" },
              { value: "98%",    label: "Satisfaction" },
              { value: "5 ans",  label: "D'expérience" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-blue-400/50 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-5 max-w-sm">
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-amber-400 text-xs">★</span>
              ))}
            </div>
            <p className="text-blue-100/80 text-sm italic leading-relaxed mb-3">
              &ldquo;La collecte à domicile m&apos;a changé la vie. Plus besoin de me
              déplacer, l&apos;agent vient chez moi. Service au top !&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                A
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Aminata D.</p>
                <p className="text-blue-400/50 text-xs">Montréal → Dakar</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-blue-400/30 text-xs">
          © {new Date().getFullYear()} La Promesse Services
        </p>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-2">
                <Package className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-bold text-gray-900">La Promesse</p>
                <p className="text-gray-400 text-xs">Canada → Afrique</p>
              </div>
            </Link>
          </div>

          <Link href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à l&apos;accueil
          </Link>

          {/* ════════════════ INSCRIPTION CONFIRMÉE ════════════════ */}
          {registeredEmail && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                  <MailCheck className="w-8 h-8 text-green-600" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Vérifiez votre email</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Un email de confirmation a été envoyé à<br />
                  <strong className="text-gray-900">{registeredEmail}</strong>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="text-sm">
                  <p className="font-semibold text-amber-800 mb-1">Vérifiez aussi vos spams</p>
                  <p className="text-amber-700 leading-relaxed">
                    Si vous ne voyez pas l&apos;email dans votre boîte principale, vérifiez le dossier
                    <strong> Spam</strong>, <strong>Courrier indésirable</strong> ou <strong>Promotions</strong>.
                  </p>
                </div>
              </div>

              <div className="text-center text-sm text-gray-400 space-y-2">
                <p>Vous avez déjà confirmé votre compte ?</p>
                <button onClick={() => { setRegisteredEmail(null); switchMode("login"); }}
                  className="text-blue-600 font-medium hover:underline">
                  Se connecter
                </button>
              </div>
            </div>
          )}

          {/* ════════════════ LIEN OUBLIÉ ENVOYÉ ════════════════ */}
          {!registeredEmail && mode === "forgot_sent" && (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                  <MailCheck className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Lien envoyé !</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Un lien de réinitialisation a été envoyé à <strong className="text-gray-900">{form.email}</strong>.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="text-sm">
                  <p className="font-semibold text-amber-800 mb-1">Vérifiez aussi vos spams</p>
                  <p className="text-amber-700 leading-relaxed">
                    L&apos;email peut arriver dans <strong>Spam</strong>, <strong>Courrier indésirable</strong> ou <strong>Promotions</strong>.
                  </p>
                </div>
              </div>
              <button onClick={() => switchMode("login")}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mx-auto">
                <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
              </button>
            </div>
          )}

          {/* ════════════════ FORMULAIRES LOGIN / REGISTER / FORGOT ════════════════ */}
          {!registeredEmail && mode !== "forgot_sent" && (
            <>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                {mode === "register" ? "Créer votre compte" : mode === "forgot" ? "Mot de passe oublié" : "Bon retour !"}
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                {mode === "register"
                  ? "Inscrivez-vous pour envoyer vos colis et les suivre en temps réel"
                  : mode === "forgot"
                  ? "Saisissez votre email pour recevoir un lien de réinitialisation"
                  : "Connectez-vous pour accéder à votre espace client"}
              </p>

              {/* Tabs register / login (sauf forgot) */}
              {mode !== "forgot" && (
                <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                  {(["register", "login"] as const).map((m) => (
                    <button key={m} onClick={() => switchMode(m)}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                        mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                      }`}>
                      {m === "register" ? "Inscription" : "Connexion"}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Formulaire Mot de passe oublié ── */}
              {mode === "forgot" && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email *</label>
                    <input name="email" type="email" required value={form.email} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="vous@email.com" autoComplete="email" />
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200">
                    {loading ? "Envoi en cours..." : "Envoyer le lien"}
                  </button>
                  <button type="button" onClick={() => switchMode("login")}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mx-auto transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
                  </button>
                </form>
              )}

              {/* ── Formulaire Inscription ── */}
              {mode === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet *</label>
                    <input name="name" required value={form.name} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Jean Dupont" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone (WhatsApp de préférence)</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="+1 514-000-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email *</label>
                    <input name="email" type="email" required value={form.email} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="vous@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe *</label>
                    <div className="relative">
                      <input name="password" type={showPassword ? "text" : "password"} required
                        value={form.password} onChange={handleChange} minLength={6}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white pr-12"
                        placeholder="6 caractères minimum" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password && (
                      <span className={`flex items-center gap-1 text-xs mt-2 ${passwordLong ? "text-green-600" : "text-gray-400"}`}>
                        <Check className={`w-3 h-3 ${passwordLong ? "" : "opacity-30"}`} />
                        6 caractères minimum
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe *</label>
                    <input name="confirmPassword" type="password" required
                      value={form.confirmPassword} onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                        form.confirmPassword ? (passwordMatch ? "border-green-300" : "border-red-300") : "border-gray-200"
                      }`}
                      placeholder="Retapez votre mot de passe" />
                    {form.confirmPassword && !passwordMatch && (
                      <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{error}</span>
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200">
                    {loading ? "Création en cours..." : "Créer mon compte"}
                  </button>
                </form>
              )}

              {/* ── Formulaire Connexion ── */}
              {mode === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email *</label>
                    <input name="email" type="email" required value={form.email} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="vous@email.com" autoComplete="email" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-700">Mot de passe *</label>
                      <button type="button" onClick={() => switchMode("forgot")}
                        className="text-xs text-blue-600 hover:underline font-medium">
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="relative">
                      <input name="password" type={showPassword ? "text" : "password"} required
                        value={form.password} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white pr-12"
                        placeholder="••••••••" autoComplete="current-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{error}</span>
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200">
                    {loading ? "Connexion en cours..." : "Se connecter"}
                  </button>
                </form>
              )}

              {/* Bottom links */}
              <div className="mt-6 text-center space-y-3">
                <div className="text-sm text-gray-400">
                  Vous souhaitez simplement{" "}
                  <Link href="/track" className="text-blue-600 font-medium hover:underline">
                    suivre un colis ?
                  </Link>
                </div>
                <a href="https://wa.me/12638668387" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  <span className="text-base">💬</span> Besoin d&apos;aide ? WhatsApp
                </a>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
