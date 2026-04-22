import { Page } from "../types";
import { Button } from "../components/ui/button";
import { ArrowLeft, Shield, Users, MapPin, Heart, Check, Star } from "lucide-react";

interface AboutPageProps {
  onNavigate: (page: Page) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
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

      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#D4A843' }}>
          <span className="text-white font-bold text-2xl">S</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">À propos de SAHABA</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          La plateforme communautaire de référence pour trouver les lieux conformes à l'éthique musulmane.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Notre mission</h2>
        <p className="text-slate-600 mb-6">
          SAHABA est né d'un constat simple : il est souvent difficile de trouver des informations fiables 
          sur les lieux et services conformes à l'éthique musulmane. Restaurants halal, mosquées, 
          boucheries, piscines non-mixtes... Ces informations sont dispersées et rarement vérifiées.
        </p>
        <p className="text-slate-600">
          Notre objectif est de centraliser ces informations et de les rendre accessibles à tous, 
          avec une garantie de qualité grâce à notre système de modération humaine.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#D4A843' + '15' }}>
            <Shield className="w-6 h-6" style={{ color: '#D4A843' }} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Fiabilité</h3>
          <p className="text-slate-600 text-sm">
            Chaque lieu est vérifié par notre équipe de modérateurs avant publication.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#476E55' + '20' }}>
            <Users className="w-6 h-6" style={{ color: '#476E55' }} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Communauté</h3>
          <p className="text-slate-600 text-sm">
            Les membres contribuent et enrichissent la base de données ensemble.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#D4A843' + '15' }}>
            <MapPin className="w-6 h-6" style={{ color: '#D4A843' }} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Précision</h3>
          <p className="text-slate-600 text-sm">
            Des filtres ultra-spécifiques pour trouver exactement ce que vous cherchez.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Fonctionnalités principales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            "Recherche géolocalisée avec rayon personnalisable",
            "Filtres spécifiques (Halal 100%, femmes uniquement, sans alcool)",
            "Système d'avis et de notes vérifiés",
            "Ouverture d'itinéraire en un clic (Google Maps, Waze, Apple Plans)",
            "Modération humaine pour garantir la qualité",
            "Application mobile responsive",
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D4A843' }}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { value: "2 500+", label: "Lieux référencés" },
          { value: "15 000+", label: "Utilisateurs actifs" },
          { value: "50+", label: "Villes couvertes" },
          { value: "4.8", label: "Note moyenne" },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 text-center shadow-sm">
            <div className="text-3xl font-bold mb-1" style={{ color: '#D4A843' }}>{stat.value}</div>
            <div className="text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#476E55' }}>
        <h2 className="text-2xl font-bold text-white mb-4">Rejoignez la communauté</h2>
        <p className="text-white/80 mb-6">
          Contribuez à enrichir la plateforme et aidez d'autres musulmans à trouver les lieux qui leur conviennent.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => onNavigate("register")}
            className="text-slate-900 font-medium border-0"
            style={{ backgroundColor: '#D4A843' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c49a3c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4A843'}
          >
            Créer un compte
          </Button>
          <Button
            onClick={() => onNavigate("propose")}
            variant="outline"
            className="text-white border-white hover:bg-white/10"
          >
            Proposer un lieu
          </Button>
        </div>
      </div>
    </div>
  );
}