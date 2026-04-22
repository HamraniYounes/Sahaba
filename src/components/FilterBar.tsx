import { Utensils, ShoppingBag, Home, Droplets, Building, Heart, PartyPopper } from "lucide-react";

interface FilterBarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const filters = [
  { id: "all", label: "Tous", icon: null },
  { id: "restaurant", label: "Restaurants", icon: Utensils },
  { id: "butcher", label: "Boucheries", icon: ShoppingBag },
  { id: "grocery", label: "Épiceries", icon: ShoppingBag },
  { id: "mosque", label: "Mosquées", icon: Home },
  { id: "pool", label: "Piscines", icon: Droplets },
  { id: "hotel", label: "Hôtels", icon: Building },
  { id: "venue", label: "Salles", icon: PartyPopper },
];

export function FilterBar({ activeFilter, setActiveFilter }: FilterBarProps) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: activeFilter === filter.id ? '#D4A843' : '#476E55',
                color: 'white',
              }}
            >
              {filter.icon && <filter.icon className="w-4 h-4" />}
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}