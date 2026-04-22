import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, MapPin, Navigation, Loader2 } from "lucide-react";

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onSearch: () => void;
}

export function Hero({ searchQuery, setSearchQuery, selectedCity, setSelectedCity, onSearch }: HeroProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await response.json();
          
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.municipality || "";
            setSelectedCity(city);
          }
        } catch (error) {
          setLocationError("Impossible de déterminer votre position");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Veuillez autoriser la géolocalisation dans votre navigateur");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Position non disponible");
            break;
          case error.TIMEOUT:
            setLocationError("Délai d'attente dépassé");
            break;
          default:
            setLocationError("Une erreur est survenue");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (locationError) {
      const timer = setTimeout(() => setLocationError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [locationError]);

  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: '#D4A843' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Trouvez les lieux halal
            <br />
            près de chez vous
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Restaurants, mosquées, bouchers et plus encore — vérifiés et recommandés par la communauté.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un lieu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-slate-200 text-slate-900 placeholder-slate-400"
                  style={{ backgroundColor: '#476E55', color: 'white' }}
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Ville ou localisation..."
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="pl-12 pr-12 h-12 border-slate-200 text-slate-900 placeholder-slate-400"
                  style={{ backgroundColor: '#476E55', color: 'white' }}
                />
                <button
                  type="button"
                  onClick={handleGeolocation}
                  disabled={isLocating}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
                  title="Utiliser ma position"
                >
                  {isLocating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5" />
                  )}
                </button>
              </div>
              <Button 
                onClick={onSearch}
                className="h-12 px-8 text-white font-medium border-0"
                style={{ backgroundColor: '#D4A843' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c49a3c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4A843'}
              >
                Rechercher
              </Button>
            </div>

            {locationError && (
              <p className="mt-2 text-sm text-red-600 text-center">{locationError}</p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="text-white/80 text-sm">Populaire:</span>
            {["Restaurant halal", "Mosquée", "Boucherie", "Piscine femmes"].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  onSearch();
                }}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}