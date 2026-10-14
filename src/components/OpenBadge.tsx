import { isOpenNow } from "../lib/hours";
import type { OpeningHours } from "../types";

export function OpenBadge({ hours }: { hours?: OpeningHours | null }) {
  const open = isOpenNow(hours);
  const [text, cls] = open === null ? ["NC", "bg-slate-100 text-slate-600"] : open ? ["Ouvert", "bg-emerald-100 text-emerald-800"] : ["Fermé", "bg-red-100 text-red-700"];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{text}</span>;
}
