import { Facebook, Link2, MessageCircle, Share2, Twitter } from "lucide-react";
import { useState } from "react";

export function ShareButtons({ url, title, compact = false }: { url: string; title: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  const native = typeof navigator !== "undefined" && "share" in navigator;
  const cls = "p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100";
  const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } };
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {native && <button className={cls} aria-label="Partager" onClick={() => navigator.share({ title, url }).catch(() => undefined)}><Share2 className="w-4 h-4" /></button>}
      {!compact && <>
        <a className={cls} aria-label="WhatsApp" target="_blank" rel="noreferrer noopener" href={`https://wa.me/?text=${t}%20${u}`}><MessageCircle className="w-4 h-4" /></a>
        <a className={cls} aria-label="Facebook" target="_blank" rel="noreferrer noopener" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`}><Facebook className="w-4 h-4" /></a>
        <a className={cls} aria-label="X" target="_blank" rel="noreferrer noopener" href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`}><Twitter className="w-4 h-4" /></a>
      </>}
      <button className={cls} aria-label="Copier le lien" onClick={copy}><Link2 className="w-4 h-4" /></button>
      {copied && <span className="text-xs text-forest">Lien copié</span>}
    </div>
  );
}
