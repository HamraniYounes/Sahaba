import { Location } from "../types";
import { MapPin, Star, Shield } from "lucide-react";

interface MapViewProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
  selectedLocation: Location | null;
}

export function MapView({ locations, onSelectLocation, selectedLocation }: MapViewProps) {
  return (
    <div className="bg-slate-200 rounded-2xl h-96 lg:h-[500px] relative overflow-hidden">
      {/* Placeholder Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Map Markers */}
      <div className="absolute inset-0 p-4">
        {locations.map((location, index) => {
          const left = 15 + (index * 12) % 70;
          const top = 10 + (index * 17) % 60;
          
          return (
            <button
              key={location.id}
              onClick={() => onSelectLocation(location)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                selectedLocation?.id === location.id ? "scale-125 z-20" : "z-10"
              }`}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <div className={`relative ${
                selectedLocation?.id === location.id 
                  ? "bg-emerald-600 text-white" 
                  : "bg-white text-emerald-600"
              } rounded-full p-2 shadow-lg`}>
                <MapPin className="w-5 h-5" />
                {location.verified && (
                  <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button className="bg-white rounded-lg p-2 shadow-md hover:bg-slate-50">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="bg-white rounded-lg p-2 shadow-md hover:bg-slate-50">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <p className="text-xs font-medium text-slate-700 mb-2">Légende</p>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <div className="w-3 h-3 bg-emerald-600 rounded-full" />
          <span>Lieu sélectionné</span>
        </div>
      </div>
    </div>
  );
}