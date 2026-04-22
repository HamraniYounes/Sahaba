import { Page } from "../types";
import { ArrowLeft } from "lucide-react";

interface LegalPageProps {
  onNavigate: (page: Page) => void;
}

export function LegalPage({ onNavigate }: LegalPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => onNavigate("home")}
        className="flex items-center gap-2 mb-8 transition-colors"
        style={{ color: '#476E55' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </button>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        <button className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap text-white" style={{ backgroundColor: '#D4A843' }}>
          Mentions légales
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap text-white" style={{ backgroundColor: '#476E55' }}>
          Politique de confidentialité
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap text-white" style={{ backgroundColor: '#476E55' }}>
          CGU
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Mentions légales</h1>

        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Éditeur du site</h2>
          <p className="text-slate-600 mb-4">
            Le site SAHABA est édité par :<br />
            <strong>SAHABA SPRL</strong><br />
            Siège social : 123 Avenue de la Constitution, 1000 Bruxelles, Belgique<br />
            Numéro d'entreprise : BE 0123.456.789<br />
            Email : contact@sahaba.be
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Directeur de la publication</h2>
          <p className="text-slate-600 mb-4">
            Le directeur de la publication est Monsieur [Nom], en qualité de gérant de la société SAHABA SPRL.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Hébergement</h2>
          <p className="text-slate-600 mb-4">
            Le site est hébergé par :<br />
            <strong>OVHcloud</strong><br />
            2 rue Kellermann<br />
            59100 Roubaix - France
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Propriété intellectuelle</h2>
          <p className="text-slate-600 mb-4">
            L'ensemble du contenu du site SAHABA (textes, images, vidéos, logos, etc.) est protégé par le droit d'auteur 
            et le droit des marques. Toute reproduction, représentation, modification, publication, adaptation de tout 
            ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation 
            écrite préalable.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Disclaimer - Certification Halal</h2>
          <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#D4A843' + '15', borderLeft: '4px solid #D4A843' }}>
            <p className="text-slate-700 font-medium">
              SAHABA est un agrégateur d'informations et non un organisme certificateur. Les informations concernant 
              la certification halal sont fournies par les établissements eux-mêmes ou par les utilisateurs de la plateforme. 
              SAHABA ne peut garantir l'exactitude de ces informations et recommande aux utilisateurs de vérifier 
              directement auprès des établissements ou des organismes certificateurs officiels.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Responsabilité</h2>
          <p className="text-slate-600 mb-4">
            SAHABA s'efforce de fournir des informations aussi précises que possible. Toutefois, elle ne pourra être 
            tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient 
            de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">7. Droit applicable</h2>
          <p className="text-slate-600 mb-4">
            Les présentes mentions légales sont soumises au droit belge. En cas de litige, les tribunaux de Bruxelles 
            seront seuls compétents.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">8. Contact</h2>
          <p className="text-slate-600 mb-4">
            Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à :<br />
            Email : legal@sahaba.be<br />
            Adresse : SAHABA SPRL, 123 Avenue de la Constitution, 1000 Bruxelles
          </p>
        </div>

        {/* Last update */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Dernière mise à jour : Janvier 2025
          </p>
        </div>
      </div>
    </div>
  );
}