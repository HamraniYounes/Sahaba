import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, FileWarning, LayoutDashboard, Megaphone, ShieldCheck, Table2, Users, BadgeCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function AdminLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const items = [
    { to: "/admin", end: true, icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/admin/moderation", icon: ShieldCheck, label: "Modération" },
    { to: "/admin/places", icon: Table2, label: "Lieux" },
    { to: "/admin/reports", icon: FileWarning, label: "Signalements" },
    { to: "/admin/claims", icon: BadgeCheck, label: "Réclamations" },
    ...(isAdmin ? [{ to: "/admin/ads", icon: Megaphone, label: "Publicité" }] : []),
    { to: "/admin/stats", icon: BarChart3, label: "Statistiques" },
    ...(isAdmin ? [{ to: "/admin/users", icon: Users, label: "Utilisateurs" }] : []),
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
      <nav className="md:w-56 shrink-0 flex md:flex-col gap-1 overflow-x-auto scrollbar-hide">
        {items.map(({ to, end, icon: I, label }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${isActive ? "bg-forest text-white" : "text-slate-600 hover:bg-slate-100"}`}>
            <I className="w-4 h-4" />{label}
          </NavLink>
        ))}
      </nav>
      <div className="flex-1 min-w-0"><Outlet /></div>
    </div>
  );
}
