import { createClient } from "@/lib/supabase/server";
import { AnnouncementComposer } from "@/components/social/AnnouncementComposer";
import { AnnouncementList } from "@/components/social/AnnouncementList";
import { Megaphone } from "lucide-react";

export default async function AnnoncesPage() {
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-violet-500 to-pink-500 p-2.5 rounded-2xl">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Annonces & Réseaux sociaux</h1>
            <p className="text-gray-500 text-sm">Rédigez et partagez en un clic sur Facebook, WhatsApp, X et plus</p>
          </div>
        </div>
      </div>

      {/* Composer */}
      <AnnouncementComposer />

      {/* Past announcements */}
      <AnnouncementList announcements={announcements ?? []} />
    </div>
  );
}
