import { Page, User } from "../types";
import { Button } from "./ui/button";
import { Search, Menu, X, User as UserIcon, LogOut, MapPin } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onNavigate: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
}

export function Header({ onNavigate, user, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D4A843' }}>
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-slate-900">SAHABA</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate("home")}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Accueil
            </button>
            <button
              onClick={() => onNavigate("about")}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              À propos
            </button>
            <button
              onClick={() => onNavigate("propose")}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Proposer un lieu
            </button>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => onNavigate("dashboard")}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                  <span>{user.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => onNavigate("login")}
                  variant="ghost"
                  className="text-slate-600"
                >
                  Connexion
                </Button>
                <Button
                  onClick={() => onNavigate("register")}
                  className="text-white border-0"
                  style={{ backgroundColor: '#D4A843' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c49a3c'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4A843'}
                >
                  Inscription
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col gap-3">
              <button
                onClick={() => { onNavigate("home"); setMobileMenuOpen(false); }}
                className="text-left px-2 py-2 text-slate-600 hover:text-slate-900"
              >
                Accueil
              </button>
              <button
                onClick={() => { onNavigate("about"); setMobileMenuOpen(false); }}
                className="text-left px-2 py-2 text-slate-600 hover:text-slate-900"
              >
                À propos
              </button>
              <button
                onClick={() => { onNavigate("propose"); setMobileMenuOpen(false); }}
                className="text-left px-2 py-2 text-slate-600 hover:text-slate-900"
              >
                Proposer un lieu
              </button>
              <div className="border-t border-slate-200 pt-3 mt-2">
                {user ? (
                  <>
                    <button
                      onClick={() => { onNavigate("dashboard"); setMobileMenuOpen(false); }}
                      className="text-left px-2 py-2 text-slate-600 hover:text-slate-900 w-full"
                    >
                      Mon compte
                    </button>
                    <button
                      onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                      className="text-left px-2 py-2 text-slate-500 hover:text-slate-700 w-full"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => { onNavigate("login"); setMobileMenuOpen(false); }}
                      variant="ghost"
                      className="w-full justify-start text-slate-600"
                    >
                      Connexion
                    </Button>
                    <Button
                      onClick={() => { onNavigate("register"); setMobileMenuOpen(false); }}
                      className="w-full mt-2 text-white border-0"
                      style={{ backgroundColor: '#D4A843' }}
                    >
                      Inscription
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}