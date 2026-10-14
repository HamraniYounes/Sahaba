import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PAGES: Record<string, { title: string; body: { h: string; p: string }[] }> = {
  cgu: {
    title: "Conditions générales d'utilisation",
    body: [
      { h: "1. Objet", p: "Sahaba est un annuaire communautaire gratuit de lieux (restaurants halal, mosquées, commerces, services…) destiné à la communauté musulmane d'Europe. L'utilisation du service implique l'acceptation des présentes conditions." },
      { h: "2. Compte utilisateur", p: "La création d'un compte est nécessaire pour proposer un lieu, publier un avis ou enregistrer des favoris. Vous êtes responsable de la confidentialité de vos identifiants et de l'exactitude des informations fournies." },
      { h: "3. Contenus proposés", p: "Les lieux, photos et avis que vous publiez doivent être exacts, légaux et respectueux. Vous garantissez détenir les droits sur les photos envoyées. Sahaba se réserve le droit de modérer, modifier, refuser ou supprimer tout contenu sans préavis, notamment après signalement." },
      { h: "4. Mentions « halal » et caractéristiques", p: "Les informations (halal, sans alcool, salle de prière…) sont déclaratives et fournies par les utilisateurs ou les propriétaires. Sahaba ne certifie pas ces informations et vous invite à les vérifier directement auprès de l'établissement." },
      { h: "5. Réclamation d'un lieu", p: "Un propriétaire peut réclamer sa fiche en fournissant des justificatifs. Les documents sont conservés de manière privée et uniquement consultables par l'équipe de modération." },
      { h: "6. Responsabilité", p: "Sahaba est fourni « en l'état ». Nous ne pouvons être tenus responsables des erreurs, omissions ou de l'indisponibilité du service, ni des relations entre utilisateurs et établissements." },
      { h: "7. Contact", p: "Pour toute question : contact@sahaba.be." },
    ],
  },
  rgpd: {
    title: "Politique de confidentialité (RGPD)",
    body: [
      { h: "Responsable du traitement", p: "Sahaba — contact : legal@sahaba.be." },
      { h: "Données collectées", p: "Adresse email, nom affiché, mot de passe (stocké sous forme chiffrée par le fournisseur d'authentification), contenus que vous publiez (lieux, photos, avis), favoris, justificatifs de réclamation, messages envoyés via le formulaire de contact. Votre position géographique est utilisée uniquement dans votre navigateur pour trier les lieux par distance ; elle n'est pas enregistrée." },
      { h: "Finalités et bases légales", p: "Fourniture du service (exécution du contrat), modération et sécurité (intérêt légitime), réponse à vos demandes (intérêt légitime), publicité éventuelle (consentement)." },
      { h: "Hébergement et sous-traitants", p: "Les données sont hébergées chez Supabase. Les tuiles de carte sont fournies par OpenStreetMap / CARTO ; le géocodage d'adresses utilise Nominatim (OpenStreetMap)." },
      { h: "Durée de conservation", p: "Vos données sont conservées tant que votre compte existe. À la suppression du compte, votre profil, vos avis et vos favoris sont effacés ; les lieux que vous avez proposés sont conservés sans lien avec vous." },
      { h: "Vos droits", p: "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. Vous pouvez supprimer votre compte à tout moment depuis votre profil, ou nous écrire à legal@sahaba.be. Vous pouvez introduire une réclamation auprès de l'Autorité de protection des données (Belgique) ou de l'autorité de votre pays." },
      { h: "Cookies", p: "Sahaba utilise uniquement des cookies / stockages techniques (session, préférence de langue et de thème). Si des annonces tierces sont activées, leur fournisseur peut déposer des cookies soumis à votre consentement." },
    ],
  },
  mentions: {
    title: "Mentions légales",
    body: [
      { h: "Éditeur", p: "Sahaba — contact@sahaba.be. Les informations de l'éditeur (dénomination, adresse, numéro d'entreprise) sont à compléter avant la mise en production." },
      { h: "Hébergement", p: "Application hébergée en France/Europe selon votre configuration ; base de données et authentification : Supabase." },
      { h: "Propriété intellectuelle", p: "Le nom, le logo et le code de Sahaba sont protégés. Les contenus publiés par les utilisateurs restent leur propriété ; ils concèdent à Sahaba une licence d'affichage dans le cadre du service." },
    ],
  },
};

export function LegalPage() {
  const { page = "mentions" } = useParams();
  const doc = PAGES[page];
  if (!doc) return <Navigate to="/legal/mentions" replace />;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 mb-6 text-forest"><ArrowLeft className="w-4 h-4" />Retour à l'accueil</Link>
      <nav className="flex gap-4 text-sm mb-6">
        {Object.entries(PAGES).map(([k, v]) => <Link key={k} to={`/legal/${k}`} className={k === page ? "font-semibold underline" : "text-slate-500"}>{v.title.split(" (")[0]}</Link>)}
      </nav>
      <h1 className="font-display text-3xl font-bold mb-6">{doc.title}</h1>
      <div className="space-y-5">{doc.body.map((s) => <section key={s.h}><h2 className="font-semibold mb-1">{s.h}</h2><p className="text-slate-700">{s.p}</p></section>)}</div>
      <p className="mt-8 text-xs text-slate-400">Dernière mise à jour : {new Date().toLocaleDateString("fr-BE")}. Texte indicatif : à faire valider avant publication.</p>
    </div>
  );
}
