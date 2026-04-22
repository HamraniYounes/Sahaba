import { Location } from "../types";
import { Star, MapPin, Clock, Shield, Users, Navigation } from "lucide-react";

interface LocationCardProps {
  location: Location;
  onClick: () => void;
}

export function LocationCard({ location, onClick }: LocationCardProps) {
  const openMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { lat, lng } = location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
      style={{ borderColor: 'transparent' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D4A843'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
    >
      {/* Image placeholder */}
      <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="w-10 h-10 text-slate-300" />
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700 capitalize">
            {location.category}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            location.isOpen 
              ? "bg-emerald-100 text-emerald-700" 
              : "bg-red-100 text-red-700"
          }`}>
            {location.isOpen ? "Ouvert" : "Fermé"}
          </span>
        </div>

        {/* Verified Badge */}
        {location.verified && (
          <div className="absolute bottom-3 right-3 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1" style={{ backgroundColor: '#D4A843' }}>
            <Shield className="w-3 h-3" />
            Vérifié
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
          {location.name}
        </h3>
        <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {location.city}, {location.country}
        </p>

        {/* Rating & Hours */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-500" style={{ color: '#D4A843' }} />
            <span className="font-medium text-slate-900">{location.rating}</span>
            <span className="text-sm text-slate-500">({location.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <Clock className="w-3.5 h-3.5" />
            {location.openingHours.split(",")[0]}
          </div>
        </div>

        {/* Metadata Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {location.metadata.halalCertified && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#D4A843' + '15', color: '#D4A843' }}>
              Halal {location.metadata.halalType === "full" ? "100%" : "Partiel"}
            </span>
          )}
          {location.metadata.womenOnly && (
            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-xs font-medium flex items-center gap-1">
              <Users className="w-3 h-3" />
              Femmes
            </span>
          )}
          {location.metadata.alcoholFree && (
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
              Sans alcool
            </span>
          )}
        </div>

        {/* Itinerary Button */}
        <button
          onClick={openMaps}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#476E55' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d5c48'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#476E55'}
        >
          <Navigation className="w-4 h-4" />
          Itinéraire
        </button>
      </div>
    </div>
  );
}