"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { SocialShareButtons } from "./SocialShareButtons";
import { Eye, EyeOff, Trash2, Send, X, Clock } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const CAT_COLORS: Record<string, string> = {
  INFO:            "bg-blue-100 text-blue-700",
  PROMO:           "bg-red-100 text-red-700",
  ALERTE:          "bg-amber-100 text-amber-700",
  TEMOIGNAGE:      "bg-green-100 text-green-700",
  NOUVEAU_SERVICE: "bg-violet-100 text-violet-700",
};

const CAT_ICONS: Record<string, string> = {
  INFO: "ℹ️", PROMO: "🔥", ALERTE: "⚠️", TEMOIGNAGE: "💬", NOUVEAU_SERVICE: "✨",
};

export function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [sharing, setSharing] = useState<string | null>(null);

  async function togglePublish(id: string, current: boolean) {
    await supabase.from("announcements").update({
      is_published: !current,
      published_at: !current ? new Date().toISOString() : null,
    }).eq("id", id);
    router.refresh();
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm("Supprimer cette annonce ?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    router.refresh();
  }

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  if (announcements.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-5xl mb-3">📣</div>
        <p className="font-semibold text-gray-700">Aucune annonce</p>
        <p className="text-gray-400 text-sm mt-1">Rédigez votre première annonce ci-dessus</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        Annonces précédentes ({announcements.length})
      </h2>

      {announcements.map(a => (
        <div key={a.id} className="card overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[a.category] ?? "bg-gray-100 text-gray-600"}`}>
                  {CAT_ICONS[a.category] ?? ""} {a.category}
                </span>
                {a.is_published ? (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Publié
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">Brouillon</span>
                )}
              </div>
              <p className="text-xs text-gray-400 flex-shrink-0">
                {new Date(a.created_at).toLocaleDateString("fr-CA")}
              </p>
            </div>

            <h3 className="font-bold text-gray-900 mb-1">{a.title}</h3>
            <p className="text-gray-500 text-sm line-clamp-2 whitespace-pre-line">{a.body}</p>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 px-4 py-2.5 flex items-center gap-1">
            <button onClick={() => setSharing(sharing === a.id ? null : a.id)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium">
              <Send className="w-3.5 h-3.5" />
              {sharing === a.id ? "Fermer" : "Partager"}
            </button>
            <button onClick={() => togglePublish(a.id, a.is_published)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
              {a.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {a.is_published ? "Dépublier" : "Publier"}
            </button>
            <button onClick={() => deleteAnnouncement(a.id)}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors ml-auto">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Share panel (expanded) */}
          {sharing === a.id && (
            <div className="border-t border-gray-100 p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Partager sur les réseaux
                </p>
                <button onClick={() => setSharing(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SocialShareButtons
                title={a.title}
                body={a.body}
                url={`${siteUrl}/track`}
                hashtags={["LaPromesse", "Canada", "Afrique", "Colis"]}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
