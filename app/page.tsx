import Link from "next/link";
import { ArrowRight, Search, CheckCircle, Package } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#04091a] text-white overflow-x-hidden">

      {/* ══════════════════════════════════════
          NAV
      ══════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-2">
                <Package className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="font-bold text-white leading-none text-sm">La Promesse</p>
              <p className="text-blue-400 text-[10px] leading-none mt-0.5">Logistiques Canada–Afrique</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[
              { href: "#comment", label: "Comment ça marche" },
              { href: "#destinations", label: "Destinations" },
              { href: "/track", label: "Suivre un colis" },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="text-sm text-blue-200/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/portal/register"
              className="hidden sm:block text-sm text-blue-200 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
              Connexion
            </Link>
            <Link href="/portal/register"
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/50">
              Créer un compte →
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center hero-grid pt-20">
        {/* Glow orbs */}
        <div className="absolute top-32 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-800/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-5 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="animate-fade-up inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 text-blue-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Service opérationnel · Montréal, Canada
            </div>

            <h1 className="animate-fade-up-d1 text-5xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6">
              Vos colis du{" "}
              <span className="text-shimmer">Canada</span>
              <br />vers{" "}
              <span className="text-blue-400">l&apos;Afrique</span>,
              <br />en toute confiance.
            </h1>

            <p className="animate-fade-up-d2 text-blue-200/70 text-lg leading-relaxed mb-10 max-w-lg">
              Suivi en temps réel, notifications automatiques, livraison porte-à-porte.
              Nous prenons soin de vos envois comme s&apos;ils étaient les nôtres.
            </p>

            <div className="animate-fade-up-d2 flex flex-col sm:flex-row gap-3 mb-14">
              <Link href="/portal/register"
                className="group inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/60 text-base">
                Ouvrir mon compte gratuit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/track"
                className="inline-flex items-center justify-center gap-2 glass text-white hover:bg-white/10 font-semibold px-7 py-4 rounded-2xl transition-all text-base">
                <Search className="w-4 h-4 text-blue-400" />
                Suivre mon colis
              </Link>
            </div>

            {/* Stats */}
            <div className="animate-fade-up-d2 grid grid-cols-3 gap-6 border-t border-white/10 pt-10">
              {[
                { value: "2 400+", label: "Colis livrés" },
                { value: "12", label: "Destinations" },
                { value: "98%", label: "Clients satisfaits" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-extrabold text-white">{s.value}</p>
                  <p className="text-blue-300/60 text-sm mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating UI mockup */}
          <div className="animate-slide-right relative flex items-center justify-center">
            {/* Main card */}
            <div className="relative w-full max-w-sm mx-auto animate-float">
              <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl" />
              <div className="relative glass rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-blue-300/60 text-xs font-medium uppercase tracking-widest">Suivi de colis</p>
                    <p className="font-mono font-bold text-lg mt-0.5">IMP-2026-0847</p>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                    Livré ✓
                  </div>
                </div>

                {/* Progress steps */}
                <div className="space-y-3 mb-5">
                  {[
                    { icon: "📦", label: "Reçu en agence", done: true, time: "Il y a 12j" },
                    { icon: "✈️", label: "En transit aérien", done: true, time: "Il y a 7j" },
                    { icon: "📍", label: "Arrivé à Ouagadougou", done: true, time: "Il y a 2j" },
                    { icon: "✅", label: "Livré au destinataire", done: true, time: "Aujourd'hui" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${step.done ? "bg-blue-500/20" : "bg-white/5"}`}>
                        {step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${step.done ? "text-white" : "text-white/30"}`}>{step.label}</p>
                      </div>
                      <p className="text-xs text-blue-300/50 flex-shrink-0">{step.time}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-500/10 rounded-xl p-3 flex items-center gap-3">
                  <div className="text-2xl">🇧🇫</div>
                  <div>
                    <p className="text-xs text-blue-300/60">Destination</p>
                    <p className="text-sm font-semibold">Ouagadougou, Burkina Faso</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -left-6 glass rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-sm font-medium animate-float-slow shadow-xl">
              <span className="text-xl">🇨🇦</span>
              <div>
                <p className="text-[10px] text-blue-300/60 leading-none">Départ</p>
                <p className="leading-none mt-0.5">Montréal</p>
              </div>
              <span className="text-blue-400 mx-1">→</span>
              <div>
                <p className="text-[10px] text-blue-300/60 leading-none">Arrivée</p>
                <p className="leading-none mt-0.5">Bamako</p>
              </div>
              <span className="text-xl">🇲🇱</span>
            </div>

            <div className="absolute -bottom-4 -right-4 glass rounded-2xl px-4 py-2.5 animate-float-d2 shadow-xl">
              <p className="text-[10px] text-blue-300/60 uppercase tracking-wider mb-1">Notification</p>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                Votre colis est livré !
              </p>
            </div>
          </div>
        </div>

        {/* Route quick track at bottom */}
        <div className="absolute bottom-10 left-0 right-0 px-5">
          <div className="max-w-xl mx-auto">
            <form action="/track" className="glass rounded-2xl p-2 flex gap-2 shadow-2xl animate-pulse-glow">
              <div className="flex-1 flex items-center gap-2.5 px-4">
                <Search className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <input name="numero" placeholder="Numéro de tracking : IMP-2026-0001"
                  className="flex-1 bg-transparent text-white placeholder-blue-300/40 outline-none font-mono text-sm py-2.5" />
              </div>
              <button type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all">
                Suivre
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DESTINATIONS
      ══════════════════════════════════════ */}
      <section id="destinations" className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-center text-blue-400/70 text-sm font-semibold uppercase tracking-widest mb-4">Nos destinations</p>
          <h2 className="text-center text-3xl font-bold mb-14">Nous livrons partout en Afrique de l&apos;Ouest</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { flag: "🇧🇫", name: "Burkina Faso", city: "Ouagadougou", active: true },
              { flag: "🇲🇱", name: "Mali",         city: "Bamako",       active: true },
              { flag: "🇸🇳", name: "Sénégal",      city: "Dakar",        active: true },
              { flag: "🇨🇮", name: "Côte d'Ivoire",city: "Abidjan",      active: true },
              { flag: "🇬🇳", name: "Guinée",       city: "Conakry",      active: false },
              { flag: "🇹🇬", name: "Togo",         city: "Lomé",         active: false },
            ].map((d) => (
              <div key={d.name}
                className={`card-hover glass rounded-2xl p-5 text-center ${d.active ? "border border-blue-500/20" : "opacity-50"}`}>
                <div className="text-4xl mb-3">{d.flag}</div>
                <p className="font-semibold text-sm">{d.name}</p>
                <p className="text-blue-300/50 text-xs mt-0.5">{d.city}</p>
                {!d.active && <p className="text-xs text-blue-400/40 mt-2">Bientôt</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          COMMENT ÇA MARCHE
      ══════════════════════════════════════ */}
      <section id="comment" className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-center text-blue-400/70 text-sm font-semibold uppercase tracking-widest mb-4">Processus</p>
          <h2 className="text-center text-3xl font-bold mb-4">Simple comme bonjour</h2>
          <p className="text-center text-blue-200/50 mb-16 max-w-md mx-auto">De la soumission à la livraison, nous gérons tout. Vous avez une visibilité complète à chaque étape.</p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                num: "01", emoji: "📝",
                color: "from-violet-500/20 to-violet-600/5",
                border: "border-violet-500/20",
                title: "Créez votre compte",
                desc: "Inscription gratuite en 2 min. Renseignez vos coordonnées et celles de votre destinataire."
              },
              {
                num: "02", emoji: "📦",
                color: "from-blue-500/20 to-blue-600/5",
                border: "border-blue-500/20",
                title: "Déposez votre colis",
                desc: "Apportez votre colis dans notre agence à Montréal. Nous l'emballons et l'étiquetons."
              },
              {
                num: "03", emoji: "✈️",
                color: "from-cyan-500/20 to-cyan-600/5",
                border: "border-cyan-500/20",
                title: "On prend le relais",
                desc: "Voie aérienne en 5-10 jours ou maritime en 30-45 jours. Suivi live inclus."
              },
              {
                num: "04", emoji: "🏠",
                color: "from-green-500/20 to-green-600/5",
                border: "border-green-500/20",
                title: "Livraison confirmée",
                desc: "Votre destinataire reçoit son colis. Vous recevez une notification de confirmation."
              },
            ].map((step) => (
              <div key={step.num}
                className={`card-hover relative bg-gradient-to-b ${step.color} border ${step.border} rounded-2xl p-6`}>
                <div className="flex items-start justify-between mb-5">
                  <div className="text-4xl">{step.emoji}</div>
                  <span className="text-5xl font-black text-white/5">{step.num}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-blue-200/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          AVANTAGES
      ══════════════════════════════════════ */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-400/70 text-sm font-semibold uppercase tracking-widest mb-4">Pourquoi nous choisir</p>
              <h2 className="text-4xl font-bold leading-tight mb-6">
                Un service qui<br />
                <span className="text-blue-400">tient ses promesses</span>
              </h2>
              <p className="text-blue-200/50 leading-relaxed mb-8">
                Depuis 5 ans, nous connectons les diasporas canadiennes avec leurs familles en Afrique de l&apos;Ouest.
                Chaque colis est traité avec le même soin, quelle que soit sa taille.
              </p>
              <Link href="/portal/register"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/50">
                Commencer maintenant <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🔍", color: "bg-blue-500/10 border-blue-500/20",  iconBg: "bg-blue-500/20",  title: "Suivi temps réel",    desc: "Notifications SMS et email à chaque changement de statut." },
                { icon: "🔒", color: "bg-green-500/10 border-green-500/20", iconBg: "bg-green-500/20", title: "100% sécurisé",       desc: "Chaque colis est inspecté, référencé et assuré à sa valeur." },
                { icon: "💬", color: "bg-amber-500/10 border-amber-500/20", iconBg: "bg-amber-500/20", title: "Support WhatsApp",    desc: "Une équipe disponible au Canada et en Afrique pour vous aider." },
                { icon: "💰", color: "bg-violet-500/10 border-violet-500/20", iconBg: "bg-violet-500/20", title: "Tarifs transparents", desc: "Pas de frais cachés. Devis exact avant tout envoi." },
              ].map((f) => (
                <div key={f.title}
                  className={`card-hover ${f.color} border rounded-2xl p-5`}>
                  <div className={`${f.iconBg} w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4`}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold mb-1.5">{f.title}</h3>
                  <p className="text-blue-200/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TÉMOIGNAGES
      ══════════════════════════════════════ */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-center text-blue-400/70 text-sm font-semibold uppercase tracking-widest mb-14">Ce que disent nos clients</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Aminata D.", city: "Montréal → Dakar", stars: 5, text: "Livraison en 7 jours, colis intact, notification à chaque étape. Je recommande à toute la diaspora !" },
              { name: "Ibrahim K.", city: "Montréal → Ouagadougou", stars: 5, text: "J'envoie des colis pour ma famille tous les 3 mois. La Promesse ne m'a jamais déçu. Professionnel et ponctuel." },
              { name: "Fatoumata B.", city: "Montréal → Bamako", stars: 5, text: "L'application de suivi est top. Mon mari a pu suivre son colis jusqu'à sa porte. Merci !" },
            ].map((t) => (
              <div key={t.name} className="card-hover glass rounded-2xl p-6">
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-blue-100/80 leading-relaxed mb-5 text-sm">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-blue-300/50 text-xs">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════ */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full" />
            <div className="relative text-6xl">📦</div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            Prêt à envoyer votre<br />
            <span className="text-blue-400">premier colis ?</span>
          </h2>
          <p className="text-blue-200/60 text-lg mb-10">
            Rejoignez 2 400+ clients qui font confiance à La Promesse pour connecter leurs familles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/portal/register"
              className="group inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-2xl shadow-blue-900/60 text-lg">
              Créer mon compte gratuit
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="https://wa.me/14399782990" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 glass hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all text-lg">
              <span className="text-xl">💬</span> Nous contacter
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid sm:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-1.5">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">La Promesse Logistiques</span>
              </div>
              <p className="text-blue-300/50 text-sm leading-relaxed">
                Service de transport de colis Canada vers Afrique de l&apos;Ouest depuis 2019.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-4 text-white/70">Navigation</p>
              <div className="space-y-2">
                {[
                  { href: "/track", label: "Suivre un colis" },
                  { href: "/portal/register", label: "Mon espace client" },
                  { href: "#comment", label: "Comment ça marche" },
                  { href: "#destinations", label: "Destinations" },
                ].map((l) => (
                  <div key={l.href}>
                    <Link href={l.href} className="text-sm text-blue-300/50 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-4 text-white/70">Contact</p>
              <div className="space-y-2">
                <a href="https://wa.me/14399782990" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-300/50 hover:text-white transition-colors">
                  <span>💬</span> WhatsApp Canada (+1 439 978-2990)
                </a>
                <a href="https://wa.me/22666031661" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-300/50 hover:text-white transition-colors">
                  <span>💬</span> WhatsApp Burkina (+226 66 03 16 61)
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-blue-300/30">
            <p>© {new Date().getFullYear()} La Promesse Logistiques. Tous droits réservés.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Opérationnel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
