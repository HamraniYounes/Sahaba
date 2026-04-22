import { useState } from "react";
import { Page, Location } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, MapPin, Star, Clock, Shield, Users, Utensils, Building, Droplets, Home as HomeIcon, ShoppingBag } from "lucide-react";

interface HomePageProps {
  onSelectLocation: (location: Location) => void;
  onNavigate: (page: Page) => void;
}

const mockLocations: Location[] = [
  {
    id: "1",
    name: "Restaurant Al Mounia",
    category: "restaurant",
    address: "123 Avenue de la Constitution",
    city: "Bruxelles",
    rating: 4.8,
    reviewCount: 124,
    isOpen: true,
    openingHours: "11:00 - 22:00",
    verified: true,
    distance: "0.5 km",
    metadata: { halalCertified: true, halalType: "full", alcoholFree: true, prayerSpace: true }
  },
  {
    id: "2",
    name: "Boucherie Medina",
    category: "butcher",
    address: "45 Rue de Brabant",
    city: "Bruxelles",
    rating: 4.9,
    reviewCount: 89,
    isOpen: true,
    openingHours: "08:00 - 19:00",
    verified: true,
    distance: "1.2 km",
    metadata: { halalCertified: true, halalType: "full" }
  },
  {
    id: "3",
    name: "Piscine Amina (Femmes)",
    category: "pool",
    address: "78 Boulevard Anspach",
    city: "Bruxelles",
    rating: 4.6,
    reviewCount: 56,
    isOpen: true,
    openingHours: "09:00 - 21:00",
    verified: true,
    distance: "2.1 km",
    metadata: { womenOnly: true }
  },
  {
    id: "4",
    name: "Mosquée Al Ghassani",
    category: "mosque",
    address: "12 Rue du Béguinage",
    city: "Bruxelles",
    rating: 4.9,
    reviewCount: 203,
    isOpen: true,
    openingHours: "05:00 - 22:00",
    verified: true,
    distance: "0.8 km",
    metadata: { prayerSpace: true }
  },
  {
    id: "5",
    name: "Hôtel Ryad",
    category: "hotel",
    address: "56 Avenue Louise",
    city: "Bruxelles",
    rating: 4.5,
    reviewCount: 67,
    isOpen: true,
    openingHours: "24h",
    verified: false,
    distance: "3.4 km",
    metadata: { halalCertified: true, halalType: "partial", prayerSpace: true }
  },
];

const categories = [
  { id: "all", label: "Tous", icon: MapPin },
  { id: "restaurant", label: "Restaurants", icon: Utensils },
  { id: "butcher", label: "Boucheries", icon: ShoppingBag },
  { id: "mosque", label: "Mosquées", icon: HomeIcon },
  { id: "pool", label: "Piscines", icon: Droplets },
  { id: "hotel", label: "Hôtels", icon: Building },
];

export function HomePage({ onSelectLocation, onNavigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [radius, setRadius] = useState("5");

  const filteredLocations = mockLocations.filter(loc => {
    if (selectedCategory !== "all" && loc.category !== selectedCategory) return false;
    if (searchQuery && !loc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4" style={{ backgroundColor: '#476E55' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Trouvez les lieux conformes à l'éthique musulmane
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Restaurants halal, mosquées, piscines non-mixtes... Découvrez les lieux vérifiés près de chez vous.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-lg max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un lieu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-200 text-slate-900 placeholder-slate-400"
                  style={{ backgroundColor: '#476E55', color: 'white' }}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 bg-white"
                >
                  <option value="1">1 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="20">20 km</option>
                </select>
                <Button
                  className="text-white border-0"
                  style={{ backgroundColor: '#D4A843' }}
                >
                  Rechercher
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: selectedCategory === cat.id ? '#D4A843' : '#476E55',
                  color: 'white',
                }}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8 px-4" style={{ backgroundColor: '#D4A843' + '08' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              {filteredLocations.length} lieu{filteredLocations.length > 1 ? 'x' : ''} trouvé{filteredLocations.length > 1 ? 's' : ''}
            </h2>
            <select className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white">
              <option>Plus proches</option>
              <option>Mieux notés</option>
              <option>Récemment ajoutés</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => onSelectLocation(location)}
                className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{location.name}</h3>
                    <p className="text-sm text-slate-500">{location.address}, {location.city}</p>
                  </div>
                  {location.verified && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#D4A843' + '15', color: '#D4A843' }}>
                      <Shield className="w-3 h-3" />
                      Vérifié
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium">{location.rating}</span>
                    <span className="text-slate-400">({location.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{location.distance}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1 text-sm ${location.isOpen ? 'text-emerald-600' : 'text-red-600'}`}>
                    <Clock className="w-4 h-4" />
                    {location.isOpen ? "Ouvert" : "Fermé"}
                  </span>
                  <span className="text-xs text-slate-400">{location.openingHours}</span>
                </div>

                {/* Metadata badges */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {location.metadata.halalCertified && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#D4A843' }}>
                      Halal {location.metadata.halalType === 'full' ? '100%' : 'Partiel'}
                    </span>
                  )}
                  {location.metadata.womenOnly && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#476E55' }}>
                      Femmes uniquement
                    </span>
                  )}
                  {location.metadata.alcoholFree && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                      Sans alcool
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {filteredLocations.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Aucun lieu trouvé pour votre recherche.</p>
              <Button
                onClick={() => onNavigate("propose")}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
              >
                Proposer un nouveau lieu
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4" style={{ backgroundColor: '#476E55' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Contribuez à la communauté</h2>
          <p className="text-white/80 mb-8">
            Aidez-nous à enrichir la base de données en proposant de nouveaux lieux conformes à l'éthique musulmane.
          </p>
          <Button
            onClick={() => onNavigate("propose")}
            size="lg"
            className="text-slate-900 font-medium border-0"
            style={{ backgroundColor: '#D4A843' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c49a3c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4A843'}
          >
            Proposer un lieu
          </Button>
        </div>
      </section>
    </div>
  );
}