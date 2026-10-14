import { NavLink } from "react-router-dom";
import { Compass, Heart, PlusCircle, User } from "lucide-react";

const items = [
  { to: "/", end: true, icon: Compass, label: "Explorer" },
  { to: "/submit", icon: PlusCircle, label: "Proposer" },
  { to: "/favorites", icon: Heart, label: "Favoris" },
  { to: "/profile", icon: User, label: "Profil" },
];

/** Navigation flottante mobile avec indicateur d'activité et safe area. */
export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-[1000] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]" aria-label="Navigation principale">
      <ul className="mx-auto max-w-md flex justify-around rounded-2xl bg-white/95 backdrop-blur border border-slate-200 shadow-lg py-1.5">
        {items.map(({ to, end, icon: I, label }) => (
          <li key={to}>
            <NavLink to={to} end={end}
              className={({ isActive }) => `relative flex flex-col items-center gap-0.5 px-4 py-1.5 text-[11px] font-medium ${isActive ? "text-forest" : "text-slate-500"}`}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute -top-1.5 h-1 w-6 rounded-full bg-gold" />}
                  <I className="w-5 h-5" />{label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
