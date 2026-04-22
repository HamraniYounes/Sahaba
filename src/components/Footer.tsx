import { Page } from "../types";
import { MapPin, Mail, Phone } from "lucide-react";

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D4A843' }}>
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold">SAHABA</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              La plateforme communautaire pour trouver les lieux conformes à l'éthique musulmane.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <MapPin className="w-4 h-4" style={{ color: '#D4A843' }} />
              <span>Bruxelles, Belgique</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#D4A843' }}>Navigation</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate("home")} className="text-slate-400 hover:text-white transition-colors text-sm">Accueil</button></li>
              <li><button onClick={() => onNavigate("propose")} className="text-slate-400 hover:text-white transition-colors text-sm">Proposer un lieu</button></li>
              <li><button onClick={() => onNavigate("about")} className="text-slate-400 hover:text-white transition-colors text-sm">À propos</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#D4A843' }}>Légal</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate("legal")} className="text-slate-400 hover:text-white transition-colors text-sm">Mentions légales</button></li>
              <li><button onClick={() => onNavigate("legal")} className="text-slate-400 hover:text-white transition-colors text-sm">Politique de confidentialité</button></li>
              <li><button onClick={() => onNavigate("legal")} className="text-slate-400 hover:text-white transition-colors text-sm">CGU</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#D4A843' }}>Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail className="w-4 h-4" /> contact@sahaba.be
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Phone className="w-4 h-4" /> +32 2 123 45 67
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
          <p>© 2025 SAHABA. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}