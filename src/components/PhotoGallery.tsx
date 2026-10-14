import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const n = photos.length;
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % n));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + n) % n));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, n]);
  if (!n) return null;
  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        <button onClick={() => setOpen(0)} className={`${n > 1 ? "col-span-4 sm:col-span-3" : "col-span-4"} overflow-hidden rounded-xl`}>
          <img src={photos[0]} alt={alt} className="h-64 sm:h-80 w-full object-cover" />
        </button>
        {n > 1 && (
          <div className="hidden sm:flex flex-col gap-2">
            {photos.slice(1, 3).map((p, i) => (
              <button key={p} onClick={() => setOpen(i + 1)} className="overflow-hidden rounded-xl flex-1 relative">
                <img src={p} alt="" loading="lazy" className="h-full w-full object-cover" />
                {i === 1 && n > 3 && <span className="absolute inset-0 bg-black/50 text-white flex items-center justify-center font-medium">+{n - 3}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      {open !== null && (
        <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center" onClick={() => setOpen(null)}>
          <button aria-label="Fermer" className="absolute top-4 right-4 text-white p-2" onClick={() => setOpen(null)}><X className="w-6 h-6" /></button>
          {n > 1 && <button aria-label="Précédente" className="absolute left-2 text-white p-2" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + n) % n); }}><ChevronLeft className="w-8 h-8" /></button>}
          <img src={photos[open]} alt={alt} className="max-h-[88vh] max-w-[92vw] object-contain" onClick={(e) => e.stopPropagation()} />
          {n > 1 && <button aria-label="Suivante" className="absolute right-2 text-white p-2" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % n); }}><ChevronRight className="w-8 h-8" /></button>}
          <span className="absolute bottom-4 text-white text-sm">{open + 1} / {n}</span>
        </div>
      )}
    </>
  );
}
