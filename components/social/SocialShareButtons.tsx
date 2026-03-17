"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

interface SocialShareButtonsProps {
  title: string;
  body: string;
  url: string;
  hashtags?: string[];
}

type Platform = {
  id: string;
  name: string;
  icon: string;
  color: string;
  hoverColor: string;
  buildUrl: (text: string, url: string, hashtags: string) => string;
};

const PLATFORMS: Platform[] = [
  {
    id: "facebook",
    name: "Facebook",
    icon: "f",
    color: "bg-[#1877F2]",
    hoverColor: "hover:bg-[#166FE5]",
    buildUrl: (text, url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: "𝕏",
    color: "bg-black",
    hoverColor: "hover:bg-gray-800",
    buildUrl: (text, url, hashtags) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}${hashtags ? `&hashtags=${encodeURIComponent(hashtags)}` : ""}`,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "💬",
    color: "bg-[#25D366]",
    hoverColor: "hover:bg-[#20BD5A]",
    buildUrl: (text, url) =>
      `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "in",
    color: "bg-[#0A66C2]",
    hoverColor: "hover:bg-[#0958A8]",
    buildUrl: (_text, url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "✈",
    color: "bg-[#0088CC]",
    hoverColor: "hover:bg-[#0077B3]",
    buildUrl: (text, url) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📷",
    color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    hoverColor: "hover:opacity-90",
    buildUrl: () => `https://www.instagram.com/`,
  },
];

export function SocialShareButtons({ title, body, url, hashtags = [] }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [sharedTo, setSharedTo] = useState<string[]>([]);

  const fullText = `${title}\n\n${body}`;
  const hashtagStr = hashtags.join(",");

  function openShare(platform: Platform) {
    const shareUrl = platform.buildUrl(fullText, url, hashtagStr);
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
    if (!sharedTo.includes(platform.id)) {
      setSharedTo(prev => [...prev, platform.id]);
    }
  }

  async function copyForPlatform(platformId: string) {
    const textForCopy = platformId === "instagram"
      ? `${fullText}\n\n${hashtags.map(h => `#${h}`).join(" ")}\n\n${url}`
      : `${fullText}\n\n${url}`;

    await navigator.clipboard.writeText(textForCopy);
    setCopied(platformId);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleNativeShare() {
    if (navigator.share) {
      await navigator.share({ title, text: body, url });
    }
  }

  return (
    <div className="space-y-4">
      {/* Platform buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PLATFORMS.map((p) => {
          const shared = sharedTo.includes(p.id);
          return (
            <div key={p.id}
              className="group relative rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <button
                onClick={() => p.id === "instagram" ? copyForPlatform("instagram") : openShare(p)}
                className={`w-full ${p.color} ${p.hoverColor} text-white p-3 flex items-center gap-3 transition-all`}
              >
                <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {p.icon}
                </span>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-sm leading-tight">{p.name}</p>
                  <p className="text-white/60 text-[10px] truncate">
                    {p.id === "instagram"
                      ? (copied === "instagram" ? "Texte copié !" : "Copier le texte")
                      : (shared ? "Partagé ✓" : "Publier")}
                  </p>
                </div>
                {shared && (
                  <Check className="w-4 h-4 text-white/80 ml-auto flex-shrink-0" />
                )}
              </button>

              {/* Copy button overlay */}
              {p.id !== "instagram" && (
                <button
                  onClick={(e) => { e.stopPropagation(); copyForPlatform(p.id); }}
                  className="absolute top-1 right-1 p-1.5 rounded-lg bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copier le texte"
                >
                  {copied === p.id ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <Copy className="w-3 h-3 text-white" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Native share (mobile) */}
      {"share" in (typeof navigator !== "undefined" ? navigator : {}) && (
        <button
          onClick={handleNativeShare}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Partager via l&apos;appareil...
        </button>
      )}

      {/* Full copy */}
      <button
        onClick={() => copyForPlatform("full")}
        className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 py-2.5 rounded-xl transition-colors text-sm"
      >
        {copied === "full" ? (
          <><Check className="w-4 h-4 text-green-500" /> Copié !</>
        ) : (
          <><Copy className="w-4 h-4" /> Copier tout le texte</>
        )}
      </button>
    </div>
  );
}
