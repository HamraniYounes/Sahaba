import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { fetchFavoriteIds, setFavorite } from "../lib/api";

interface FavState {
  ids: Set<string>;
  toggle: (locationId: string) => Promise<"login" | "ok">;
}
const Ctx = createContext<FavState | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { setIds(new Set()); return; }
    fetchFavoriteIds(user.id).then((a) => setIds(new Set(a))).catch(() => setIds(new Set()));
  }, [user]);

  const toggle = useCallback(async (locationId: string) => {
    if (!user) return "login" as const;
    const on = !ids.has(locationId);
    setIds((prev) => { const n = new Set(prev); if (on) n.add(locationId); else n.delete(locationId); return n; });
    try { await setFavorite(user.id, locationId, on); }
    catch {
      setIds((prev) => { const n = new Set(prev); if (on) n.delete(locationId); else n.add(locationId); return n; });
    }
    return "ok" as const;
  }, [user, ids]);

  return <Ctx.Provider value={{ ids, toggle }}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFavorites doit être utilisé dans <FavoritesProvider>");
  return v;
}
