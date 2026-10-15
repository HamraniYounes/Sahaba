import { useEffect, useState } from "react";
import { fetchActiveAds } from "../lib/api";
import { supabaseConfigured } from "../lib/supabase";
import { safeHttpUrl } from "../lib/url";
import type { Ad } from "../types";

export function AdBanner({ placement }: { placement: "home" | "detail" }) {
  const [ad, setAd] = useState<Ad | null>(null);
  useEffect(() => {
    if (!supabaseConfigured) return;
    fetchActiveAds(placement).then((a) => setAd(a.length ? a[Math.floor(Math.random() * a.length)] : null)).catch(() => setAd(null));
  }, [placement]);
  if (!ad) return null;
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col sm:flex-row">
      {safeHttpUrl(ad.imageUrl) && <img src={safeHttpUrl(ad.imageUrl)!} alt="" loading="lazy" className="sm:w-40 h-28 sm:h-auto object-cover" />}
      <div className="p-4 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-slate-400">Annonce</p>
        <h3 className="font-semibold">{ad.title}</h3>
        {ad.description && <p className="text-sm text-slate-600 mt-0.5">{ad.description}</p>}
        {safeHttpUrl(ad.url) && ad.cta && (
          <a href={safeHttpUrl(ad.url)!} target="_blank" rel="sponsored noreferrer noopener" className="inline-block mt-2 text-sm font-medium text-white bg-forest rounded-lg px-3 py-1.5">{ad.cta}</a>
        )}
      </div>
    </aside>
  );
}
