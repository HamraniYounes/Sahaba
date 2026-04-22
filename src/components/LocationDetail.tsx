import { Location } from "../types";
import { Button } from "./ui/button";
import { X, Star, MapPin, Clock, Phone, Globe, Shield, Users, Heart, Navigation, Share, ExternalLink } from "lucide-react";
import { useState } from "react";

interface LocationDetailProps {
  location: Location;
  onClose: () => void;
}

export function LocationDetail({ location, onClose }: LocationDetailProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Fonction pour ouvrir l'itinéraire dans différentes applications
  const openDirections = (provider: 'google' | 'apple' | 'waze') => {
    const { latitude, longitude, name, address } = location;
    let url: string;

    switch (provider) {
      case 'google':
        // Google Maps avec itinéraire
        url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodeURIComponent(name)}`;
        break;
      case 'apple':
        // Apple Maps avec itinéraire
        url = `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
        break;
      case 'waze':
        // Waze avec itinéraire
        url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
        break;
      default:
        url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Fonction pour partager le lieu
  const shareLocation = async () => {
    const shareData = {
      title: location.name,
      text: `${location.name} - ${location.address}, ${location.city}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header Image */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-br from-emerald-400 to-emerald-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white/50" />
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>

          {/* Verified Badge */}
          {location.verified && (
            <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Vérifié
            </div>
          )}

          {/* Favorite Button */}
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute bottom-4 right-4 bg-white/90 rounded-full p-3 hover:bg-white transition-colors"
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title & Rating */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{location.name}</h2>
              <p className="text-slate-600">{location.address}, {location.city}</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-bold text-slate-900">{location.rating}</span>
              <span className="text-sm text-slate-500">({location.reviewCount})</span>
            </div>
          </div>

          {/* Status & Hours */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              location.isOpen 
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-red-100 text-red-700"
            }`}>
              <Clock className="w-4 h-4" />
              {location.isOpen ? "Ouvert" : "Fermé"}
            </span>
            <span className="text-sm text-slate-600">{location.openingHours}</span>
          </div>

          {/* Navigation Buttons */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4" style={{ color: '#476E55' }} />
              Itinéraire
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => openDirections('google')}
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 border-slate-300 hover:border-slate-400"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Maps_icon_%282020%29.svg/512px-Google_Maps_icon_%282020%29.svg.png" 
                  alt="Google Maps" 
                  className="w-6 h-6"
                />
                <span className="text-xs text-slate-600">Google Maps</span>
              </Button>
              <Button
                onClick={() => openDirections('apple')}
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 border-slate-300 hover:border-slate-400"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/AppleMaps_logo.svg/512px-AppleMaps_logo.svg.png" 
                  alt="Apple Maps" 
                  className="w-6 h-6"
                />
                <span className="text-xs text-slate-600">Apple Maps</span>
              </Button>
              <Button
                onClick={() => openDirections('waze')}
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 border-slate-300 hover:border-slate-400"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Waze_logo.svg/512px-Waze_logo.svg.png" 
                  alt="Waze" 
                  className="w-6 h-6"
                />
                <span className="text-xs text-slate-600">Waze</span>
              </Button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {location.metadata.halalCertified && (
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Halal {location.metadata.halalType === "full" ? "100%" : "Partiel"}</span>
                </div>
                <p className="text-xs text-emerald-600">Certification vérifiée</p>
              </div>
            )}
            
            {location.metadata.womenOnly && (
              <div className="bg-rose-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-rose-700 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Femmes uniquement</span>
                </div>
                <p className="text-xs text-rose-600">Espace non-mixte</p>
              </div>
            )}

            {location.metadata.alcoholFree && (
              <div className="bg-amber-50 rounded-lg p-3">
                <span className="text-sm font-medium text-amber-700">🚫 Sans alcool</span>
                <p className="text-xs text-amber-600">Environnement respectueux</p>
              </div>
            )}

            {location.metadata.prayerSpace && (
              <div className="bg-indigo-50 rounded-lg p-3">
                <span className="text-sm font-medium text-indigo-700">🕌 Espace prière</span>
                <p className="text-xs text-indigo-600">Salle disponible</p>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-3 mb-6">
            {location.phone && (
              <a 
                href={`tel:${location.phone}`}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Phone className="w-5 h-5" style={{ color: '#476E55' }} />
                <span className="text-slate-700">{location.phone}</span>
              </a>
            )}
            {location.website && (
              <a 
                href={location.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Globe className="w-5 h-5" style={{ color: '#476E55' }} />
                <span className="text-slate-700">Site web</span>
                <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
              </a>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={shareLocation}
              variant="outline"
              className="flex-1 border-slate-300"
            >
              <Share className="w-4 h-4 mr-2" />
              Partager
            </Button>
            <Button
              onClick={() => openDirections('google')}
              className="flex-1 text-white border-0"
              style={{ backgroundColor: '#476E55' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a5a47'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#476E55'}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Y aller
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate-500 text-center mt-4 pt-4 border-t border-slate-200">
            ⚠️ SAHABA est un agrégateur d'informations et non un organisme certificateur. 
            Vérifiez toujours les certifications sur place.
          </p>
        </div>
      </div>
    </div>
  );
}