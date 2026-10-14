import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({ children, moderator = false }: { children: ReactNode; moderator?: boolean }) {
  const { user, loading, isModerator } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (moderator && !isModerator) return <Navigate to="/" replace />;
  return <>{children}</>;
}
