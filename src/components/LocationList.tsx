import { Location } from "../types";
import { MapPin, Star, Clock, Shield, Heart } from "lucide-react";

interface LocationListProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
  selectedLocation: Location | null;
  isGridView?: boolean;
}

export function LocationList({ locations, onSelectLocation, selectedLocation, isGridView }: LocationListProps) {
  if (isGridView) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            isSelected={selectedLocation?.id === location.id}
            onSelect={() => onSelectLocation(location)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-900 mb-4">Lieux à proximité</h3>
      {locations.map((location) => (
        <LocationCard
          key={location.id}
          location={location}
          isSelected={selectedLocation?.id === location.id}
          onSelect={() => onSelectLocation(location)}
        />
      ))}
    </div>
  );
}

function LocationCard({ location, isSelected, onSelect }: { location: Location; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left bg-white rounded-xl border-2 p-4 transition-all hover:shadow-md ${
        isSelected ? "border-emerald-500 shadow-md" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-slate-900 truncate">{location.name}</h4>
              <p className="text-sm text-slate-500 truncate">{location.address}, {location.city}</p>
            </div>
            {location.verified && (
              <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
                <Shield className="w-3 h-3" />
                Vérifié
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium text-slate-700">{location.rating}</span>
              <span className="text-xs text-slate-400">({location.reviewCount})</span>
            </div>
            <span className={`flex items-center gap-1 text-xs ${
              location.isOpen ? "text-emerald-600" : "text-red-500"
            }`}>
              <Clock className="w-3 h-3" />
              {location.isOpen ? "Ouvert" : "Fermé"}
            </span>
          </div>
          {location.metadata.halalCertified && (
            <div className="mt-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                Halal {location.metadata.halalType === "full" ? "100%" : "Partiel"}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}