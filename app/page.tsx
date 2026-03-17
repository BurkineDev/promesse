import Link from "next/link";
import { Package, Search, ArrowRight, MapPin, Shield, Clock, Phone } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Promesse — Logistique Canada-Afrique",
  description: "Envoyez vos colis du Canada vers l'Afrique en toute sécurité. Suivi en temps réel, service personnalisé.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-blue-700 rounded-xl p-1.5">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-gray-900 text-sm">La Promesse</p>
              <p className="text-gray-400 text-[10px]">Canada → Afrique</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/track" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 hidden sm:block">
              Suivre un colis
            </Link>
            <Link href="/portal/register" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2">
              Se connecter
            </Link>
            <Link href="/portal/register" className="btn-primary text-sm py-2 px-4">
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-blue-200 text-sm mb-6">
            <MapPin className="w-3.5 h-3.5" />
            Montréal · Ouagadougou · Bamako · Dakar · Abidjan
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
            Envoyez vos colis du<br className="hidden sm:block" />
            <span className="text-blue-300"> Canada vers l&apos;Afrique</span>
          </h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto mb-10">
            Service logistique fiable, suivi en temps réel, prise en charge personnalisée.
            Vos proches reçoivent ce qui compte.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Link
              href="/portal/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-800 font-semibold px-7 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-base shadow-lg"
            >
              Créer mon compte gratuit
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center justify-center gap-2 bg-blue-600/40 text-white border border-white/20 font-medium px-7 py-3.5 rounded-xl hover:bg-blue-600/60 transition-colors text-base"
            >
              <Search className="w-4 h-4" />
              Suivre mon colis
            </Link>
          </div>

          {/* Quick tracking strip */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 max-w-lg mx-auto text-left">
            <p className="text-blue-200 text-xs mb-2 font-medium uppercase tracking-wide">Suivi rapide</p>
            <form action="/track" className="flex gap-2">
              <input
                name="numero"
                placeholder="Ex : IMP-2026-0001"
                className="flex-1 bg-white/20 text-white placeholder-blue-300 rounded-xl px-4 py-2.5 outline-none focus:bg-white/30 font-mono text-sm"
              />
              <button
                type="submit"
                className="bg-white text-blue-800 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                Chercher
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Comment ça marche ?</h2>
            <p className="text-gray-500">Simple, rapide, transparent — en 4 étapes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", icon: "📝", title: "Soumettez", desc: "Créez votre compte et soumettez votre demande d'envoi en ligne." },
              { step: "2", icon: "📦", title: "Déposez", desc: "Apportez votre colis dans notre agence à Montréal ou on le récupère." },
              { step: "3", icon: "✈️", title: "On expédie", desc: "Votre colis part par voie aérienne ou maritime selon votre choix." },
              { step: "4", icon: "✅", title: "Livré !", desc: "Votre destinataire reçoit le colis. Vous êtes notifié à chaque étape." },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">
                  Étape {s.step}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Avantages ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-11 h-11 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Suivi en temps réel</h3>
                <p className="text-gray-500 text-sm">Votre numéro de tracking vous permet de localiser votre colis à chaque étape du trajet.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-11 h-11 bg-green-100 rounded-2xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Service sécurisé</h3>
                <p className="text-gray-500 text-sm">Chaque colis est inspecté, référencé et assuré. Votre envoi est entre de bonnes mains.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-11 h-11 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Délais maîtrisés</h3>
                <p className="text-gray-500 text-sm">Voie aérienne ou maritime selon votre budget. Notifications automatiques à chaque changement de statut.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-20 bg-blue-700">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à envoyer votre premier colis ?</h2>
          <p className="text-blue-200 mb-8">Créez votre compte gratuitement et soumettez votre première demande en moins de 5 minutes.</p>
          <Link
            href="/portal/register"
            className="inline-flex items-center gap-2 bg-white text-blue-800 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-base shadow-lg"
          >
            Commencer maintenant
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-white">
              <div className="bg-blue-700 rounded-xl p-1.5">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">La Promesse Logistiques</span>
            </div>
            <div className="flex flex-wrap justify-center gap-5 text-sm">
              <Link href="/track" className="hover:text-white transition-colors">Suivre un colis</Link>
              <Link href="/portal/register" className="hover:text-white transition-colors">Mon espace client</Link>
              <a href="https://wa.me/14399782990" target="_blank" rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> WhatsApp Canada
              </a>
              <a href="https://wa.me/22666031661" target="_blank" rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> WhatsApp Burkina
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs">
            © {new Date().getFullYear()} La Promesse Logistiques — Montréal, Canada
          </div>
        </div>
      </footer>
    </div>
  );
}
