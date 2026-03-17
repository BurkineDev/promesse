"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SocialShareButtons } from "./SocialShareButtons";
import { Eye, PenLine, Send, Image as ImageIcon, X, Sparkles } from "lucide-react";

const CATEGORIES = [
  { value: "INFO",            label: "ℹ️ Info",          color: "bg-blue-100 text-blue-700" },
  { value: "PROMO",           label: "🔥 Promo",         color: "bg-red-100 text-red-700" },
  { value: "ALERTE",          label: "⚠️ Alerte",        color: "bg-amber-100 text-amber-700" },
  { value: "TEMOIGNAGE",      label: "💬 Témoignage",    color: "bg-green-100 text-green-700" },
  { value: "NOUVEAU_SERVICE", label: "✨ Nouveau",       color: "bg-violet-100 text-violet-700" },
];

const TEMPLATES = [
  {
    label: "📦 Nouveau départ",
    title: "Nouveau départ de colis !",
    body: "Un nouveau lot de colis part de Montréal cette semaine ! 🛫\n\nDéposez vos colis avant vendredi pour le prochain envoi.\n\n📍 Collecte à domicile disponible\n📞 WhatsApp : +1 439 978-2990",
    category: "INFO",
  },
  {
    label: "🔥 Promo",
    title: "Promotion spéciale !",
    body: "🎉 Offre limitée !\n\n-15% sur tous les envois aériens cette semaine.\n\nCode promo : PROMESSE15\n\nConditions :\n✅ Valable jusqu'au dimanche\n✅ Toutes destinations\n\n📞 +1 439 978-2990",
    category: "PROMO",
  },
  {
    label: "✅ Livraison",
    title: "Livraison confirmée !",
    body: "✅ Lot de colis bien arrivé à Ouagadougou !\n\nTous les clients ont été notifiés. Merci pour votre confiance.\n\n🔍 Suivez vos colis sur notre site",
    category: "INFO",
  },
  {
    label: "✨ Service",
    title: "Nouveau service disponible",
    body: "🚚 NOUVEAU : Collecte à domicile à Montréal !\n\nPlus besoin de vous déplacer. Notre agent vient récupérer vos colis directement chez vous.\n\n📅 Réservation en ligne\n📍 Disponible dans tout le Grand Montréal",
    category: "NOUVEAU_SERVICE",
  },
];

export function AnnouncementComposer() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"edit" | "preview" | "share">("edit");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "INFO",
    image_url: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  function applyTemplate(tpl: typeof TEMPLATES[0]) {
    setForm({ title: tpl.title, body: tpl.body, category: tpl.category, image_url: "" });
    setMode("edit");
  }

  async function handlePublish() {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("announcements")
      .insert({
        title: form.title,
        body: form.body,
        category: form.category,
        image_url: form.image_url || null,
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setSavedId(data.id);
      setMode("share");
      router.refresh();
    }
    setSaving(false);
  }

  async function handleSaveDraft() {
    if (!form.title.trim()) return;
    setSaving(true);
    await supabase.from("announcements").insert({
      title: form.title,
      body: form.body,
      category: form.category,
      image_url: form.image_url || null,
      is_published: false,
    });
    setSaving(false);
    router.refresh();
    setForm({ title: "", body: "", category: "INFO", image_url: "" });
  }

  const cat = CATEGORIES.find(c => c.value === form.category);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = savedId
    ? `${siteUrl}/annonces/${savedId}`
    : `${siteUrl}/track`;

  const hashtags = ["LaPromesse", "Canada", "Afrique", "Colis", "Logistique"];

  return (
    <div className="card overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100">
        {[
          { id: "edit" as const, icon: PenLine, label: "Rédiger" },
          { id: "preview" as const, icon: Eye, label: "Aperçu" },
          { id: "share" as const, icon: Send, label: "Partager" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all border-b-2 ${
              mode === tab.id
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* ═══ EDIT MODE ═══ */}
        {mode === "edit" && (
          <div className="space-y-4">
            {/* Quick templates */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Modèles rapides
              </p>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map(tpl => (
                  <button key={tpl.label} onClick={() => applyTemplate(tpl)}
                    className="text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="label">Titre de l&apos;annonce *</label>
                <input name="title" value={form.title} onChange={handleChange}
                  className="input" placeholder="Nouveau départ de colis !" />
              </div>
              <div>
                <label className="label">Catégorie</label>
                <select name="category" value={form.category} onChange={handleChange} className="input">
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Contenu *</label>
              <textarea name="body" value={form.body} onChange={handleChange}
                rows={6} className="input resize-none font-sans"
                placeholder="Rédigez votre annonce ici... Les emojis sont les bienvenus ! 🎉" />
              <p className="text-right text-xs text-gray-400 mt-1">{form.body.length} caractères</p>
            </div>

            <div>
              <label className="label flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> URL de l&apos;image (optionnel)
              </label>
              <input name="image_url" value={form.image_url} onChange={handleChange}
                className="input" placeholder="https://images.unsplash.com/..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handlePublish} disabled={saving || !form.title || !form.body}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-base">
                <Send className="w-4 h-4" />
                {saving ? "Publication..." : "Publier & Partager"}
              </button>
              <button onClick={handleSaveDraft} disabled={saving || !form.title}
                className="btn-secondary px-5">
                Brouillon
              </button>
            </div>
          </div>
        )}

        {/* ═══ PREVIEW MODE ═══ */}
        {mode === "preview" && (
          <div className="space-y-4">
            {!form.title && !form.body ? (
              <div className="text-center py-12 text-gray-400">
                <PenLine className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Rédigez d&apos;abord votre annonce</p>
              </div>
            ) : (
              <>
                {/* Social media preview card */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aperçu réseaux sociaux</p>

                {/* Facebook style preview */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="p-3 flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm">
                      LP
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">La Promesse Logistiques</p>
                      <p className="text-xs text-gray-400">Maintenant · 🌍</p>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-sm text-gray-900 whitespace-pre-line leading-relaxed">{form.body}</p>
                    {form.image_url && (
                      <div className="mt-3 rounded-xl overflow-hidden bg-gray-100 h-48 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs text-blue-600 mt-2">
                      {hashtags.map(h => `#${h}`).join(" ")}
                    </p>
                  </div>
                  <div className="border-t border-gray-100 px-3 py-2 flex justify-around text-gray-500 text-sm">
                    <span>👍 J&apos;aime</span>
                    <span>💬 Commenter</span>
                    <span>↗️ Partager</span>
                  </div>
                </div>

                {/* WhatsApp style preview */}
                <div className="bg-[#e5ddd5] rounded-xl p-4">
                  <div className="bg-white rounded-xl rounded-tl-none p-3 max-w-sm shadow-sm">
                    <p className="text-sm font-semibold text-green-700 mb-1">La Promesse Logistiques</p>
                    <p className="text-sm text-gray-900 whitespace-pre-line">{form.body.substring(0, 200)}{form.body.length > 200 ? "..." : ""}</p>
                    <p className="text-xs text-blue-600 mt-1">{shareUrl}</p>
                    <p className="text-right text-[10px] text-gray-400 mt-1">12:00 ✓✓</p>
                  </div>
                </div>

                <button onClick={() => setMode("edit")}
                  className="btn-secondary w-full flex items-center justify-center gap-2">
                  <PenLine className="w-4 h-4" /> Modifier
                </button>
              </>
            )}
          </div>
        )}

        {/* ═══ SHARE MODE ═══ */}
        {mode === "share" && (
          <div className="space-y-5">
            {!form.title ? (
              <div className="text-center py-12 text-gray-400">
                <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Publiez d&apos;abord votre annonce</p>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="font-semibold text-green-800">Annonce publiée !</p>
                    <p className="text-green-700 text-sm mt-0.5">
                      Partagez-la maintenant sur vos réseaux sociaux en un clic
                    </p>
                  </div>
                </div>

                {/* Current post summary */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    {cat && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>}
                  </div>
                  <p className="font-bold text-gray-900">{form.title}</p>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-3">{form.body}</p>
                </div>

                {/* Social share buttons */}
                <SocialShareButtons
                  title={form.title}
                  body={form.body}
                  url={shareUrl}
                  hashtags={hashtags}
                />

                {/* Start new */}
                <button onClick={() => {
                  setForm({ title: "", body: "", category: "INFO", image_url: "" });
                  setSavedId(null);
                  setMode("edit");
                }}
                  className="w-full btn-secondary flex items-center justify-center gap-2 py-3">
                  <PenLine className="w-4 h-4" /> Nouvelle annonce
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
