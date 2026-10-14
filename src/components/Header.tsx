import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, ShieldCheck, User as UserIcon, X } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";

export function Header() {
  const { user, signOut, isModerator } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const link = ({ isActive }: { isActive: boolean }) =>
    `transition-colors ${isActive ? "text-slate-900 font-medium" : "text-slate-600 hover:text-slate-900"}`;
  const close = () => setOpen(false);
  const logout = async () => { close(); await signOut(); navigate("/"); };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-[1000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2" onClick={close}>
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold">SAHABA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={link}>Accueil</NavLink>
          <NavLink to="/about" className={link}>À propos</NavLink>
          <NavLink to="/submit" className={link}>Proposer un lieu</NavLink>
          {isModerator && <NavLink to="/admin" className={link}>Administration</NavLink>}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                {isModerator ? <ShieldCheck className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                {user.name || "Mon compte"}
              </Link>
              <Button variant="outline" onClick={logout}><LogOut className="w-4 h-4" />Déconnexion</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>Connexion</Button>
              <Button onClick={() => navigate("/register")}>Inscription</Button>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button className="p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-3">
          <LanguageSelector />
          <Link to="/" onClick={close}>Accueil</Link>
          <Link to="/about" onClick={close}>À propos</Link>
          <Link to="/submit" onClick={close}>Proposer un lieu</Link>
          {isModerator && <Link to="/admin" onClick={close}>Modération</Link>}
          {user ? (
            <>
              <Link to="/profile" onClick={close}>Mon profil</Link>
              <Link to="/favorites" onClick={close}>Favoris</Link>
              <button className="text-left" onClick={logout}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={close}>Connexion</Link>
              <Link to="/register" onClick={close}>Inscription</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
