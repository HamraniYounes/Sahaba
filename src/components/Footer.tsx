import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gold flex items-center justify-center text-white font-bold">S</div>
            <span className="text-white font-bold">SAHABA</span>
          </div>
          <p className="text-sm max-w-xs">L'annuaire communautaire des lieux halal et adaptés en Belgique.</p>
        </div>
        <ul className="text-sm space-y-2">
          <li><Link className="hover:text-white" to="/about">À propos</Link></li>
          <li><Link className="hover:text-white" to="/submit">Proposer un lieu</Link></li>
          <li><Link className="hover:text-white" to="/contact">Contact</Link></li>
          <li><Link className="hover:text-white" to="/legal/mentions">Mentions légales</Link></li>
          <li><Link className="hover:text-white" to="/legal/cgu">CGU</Link></li>
          <li><Link className="hover:text-white" to="/legal/rgpd">Confidentialité (RGPD)</Link></li>
        </ul>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Sahaba. Tous droits réservés.
      </div>
    </footer>
  );
}
