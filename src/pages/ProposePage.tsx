import { useState } from "react";
import { Page, User } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ArrowLeft, MapPin, Phone, Globe, Clock, Users, Shield, Utensils, Building, Droplets, ShoppingBag, Home, Heart, PartyPopper, Lock } from "lucide-react";

interface ProposePageProps {
  onNavigate: (page: Page) => void;
  user: User | null;
}

const categories = [
  { id: "restaurant", label: "Restaurant", icon: Utensils },
  { id: "butcher", label: "Boucherie", icon: ShoppingBag },
  { id: "grocery", label: "Épicerie", icon: ShoppingBag },
  { id: "mosque", label: "Mosquée", icon: Home },
  { id: "pool", label: "Piscine", icon: Droplets },
  { id: "hotel", label: "Hôtel", icon: Building },
  { id: "venue", label: "Salle de fêtes", icon: PartyPopper },
];

export function ProposePage({ onNavigate, user }: ProposePageProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    address: "",
    city: "",
    phone: "",
    website: "",
    description: "",
    halalCertified: false,
    halalType: "",
    womenOnly: false,
    alcoholFree: false,
    prayerSpace: false,
    capacity: "",
    cateringService: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Not logged in state
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#476E55' + '15' }}>
            <Lock className="w-8 h-8" style={{ color: '#476E55' }} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Connexion requise</h2>
          <p className="text-slate-600 mb-6">
            Vous devez être connecté pour proposer un nouveau lieu à la communauté SAHABA.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => onNavigate("login")}
              className="text-white border-0 font-medium"
              style={{ backgroundColor: '#D4A843' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c49a3c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4A843'}
            >
              Se connecter
            </Button>
            <Button
              onClick={() => onNavigate("register")}
              className="text-white border-0 font-medium"
              style={{ backgroundColor: '#476E55' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a5a47'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#476E55'}
            >
              Créer un compte
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#D4A843' + '20' }}>
            <Shield className="w-8 h-8" style={{ color: '#D4A843' }} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Proposition envoyée !</h2>
          <p className="text-slate-600 mb-6">
            Merci pour votre contribution, <strong>{user.name}</strong>. Notre équipe de modération va vérifier les informations 
            et valider le lieu dans les meilleurs délais.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Vous serez notifié dès que votre proposition sera validée.
          </p>
          <Button
            onClick={() => onNavigate("home")}
            className="text-white border-0"
            style={{ backgroundColor: '#D4A843' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c49a3c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4A843'}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => onNavigate("home")}
        className="flex items-center gap-2 mb-6 transition-colors"
        style={{ color: '#476E55' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">Proposer un nouveau lieu</h1>
          </div>
          <p className="text-slate-600">
            Aidez la communauté à découvrir de nouveaux lieux conformes à l'éthique musulmane.
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: '#476E55' }}>
            <Users className="w-4 h-4" />
            <span>Connecté en tant que <strong>{user.name}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Informations générales
            </h2>

            <div>
              <Label htmlFor="name" className="text-slate-700 font-medium">Nom du lieu *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Restaurant Al Mounia"
                required
                className="mt-1 bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                style={{ '--tw-ring-color': '#D4A843' } as React.CSSProperties}
              />
            </div>

            <div>
              <Label className="text-slate-700 font-medium">Catégorie *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all"
                    style={{
                      backgroundColor: formData.category === cat.id ? '#476E55' : 'white',
                      borderColor: formData.category === cat.id ? '#476E55' : '#d1d5db',
                      color: formData.category === cat.id ? 'white' : '#374151',
                    }}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address" className="text-slate-700 font-medium">Adresse *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ex: 123 Avenue de la Constitution"
                    required
                    className="pl-10 bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="city" className="text-slate-700 font-medium">Ville *</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ex: Bruxelles"
                  required
                  className="mt-1 bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-slate-700 font-medium">Téléphone</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ex: +32 2 123 45 67"
                    className="pl-10 bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website" className="text-slate-700 font-medium">Site web</Label>
                <div className="relative mt-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="Ex: www.example.com"
                    className="pl-10 bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez ce lieu en quelques mots..."
                rows={3}
                className="mt-1 bg-white border-slate-300 text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Caractéristiques spécifiques */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Caractéristiques spécifiques
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.halalCertified}
                  onChange={(e) => setFormData({ ...formData, halalCertified: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 bg-white"
                  style={{ accentColor: '#476E55' }}
                />
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" style={{ color: '#476E55' }} />
                  <span className="text-slate-700 font-medium">Certification Halal</span>
                </div>
              </label>

              {formData.halalCertified && (
                <div className="ml-8 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="halalType"
                      value="full"
                      checked={formData.halalType === "full"}
                      onChange={(e) => setFormData({ ...formData, halalType: e.target.value })}
                      className="w-4 h-4 border-slate-300 bg-white"
                      style={{ accentColor: '#476E55' }}
                    />
                    <span className="text-slate-600">Halal 100% (toute la viande est halal)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="halalType"
                      value="partial"
                      checked={formData.halalType === "partial"}
                      onChange={(e) => setFormData({ ...formData, halalType: e.target.value })}
                      className="w-4 h-4 border-slate-300 bg-white"
                      style={{ accentColor: '#476E55' }}
                    />
                    <span className="text-slate-600">Halal partiel (certaines options halal)</span>
                  </label>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.womenOnly}
                  onChange={(e) => setFormData({ ...formData, womenOnly: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 bg-white"
                  style={{ accentColor: '#476E55' }}
                />
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: '#D4A843' }} />
                  <span className="text-slate-700 font-medium">Espace femmes uniquement</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.alcoholFree}
                  onChange={(e) => setFormData({ ...formData, alcoholFree: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 bg-white"
                  style={{ accentColor: '#476E55' }}
                />
                <span className="text-slate-700 font-medium">🚫 Sans service d'alcool</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.prayerSpace}
                  onChange={(e) => setFormData({ ...formData, prayerSpace: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 bg-white"
                  style={{ accentColor: '#476E55' }}
                />
                <span className="text-slate-700 font-medium">🕌 Espace prière disponible</span>
              </label>

              {formData.category === "venue" && (
                <div className="mt-4">
                  <Label htmlFor="capacity" className="text-slate-700 font-medium">Capacité maximale</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Ex: 200"
                    className="mt-1 w-48 bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                  />
                </div>
              )}

              {(formData.category === "venue" || formData.category === "restaurant") && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cateringService}
                    onChange={(e) => setFormData({ ...formData, cateringService: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 bg-white"
                    style={{ accentColor: '#476E55' }}
                  />
                  <span className="text-slate-700 font-medium">🍽️ Service traiteur halal disponible</span>
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full text-white border-0 font-medium py-3"
              style={{ backgroundColor: '#D4A843' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c49a3c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4A843'}
            >
              Soumettre pour vérification
            </Button>
            <p className="text-xs text-slate-500 text-center mt-3">
              En soumettant ce formulaire, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}