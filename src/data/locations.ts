import { Location } from "../types";

export const locations: Location[] = [
  {
    id: "1",
    name: "Restaurant Al Mounia",
    slug: "restaurant-al-mounia-bruxelles",
    category: "restaurant",
    address: "42 Rue de la Paix",
    city: "Bruxelles",
    coordinates: { lat: 50.8503, lng: 4.3517 },
    rating: 4.7,
    reviewCount: 234,
    isOpen: true,
    openingHours: "11:30 - 22:00",
    phone: "+32 2 123 45 67",
    website: "https://almounia.be",
    image: "/restaurant1.jpg",
    metadata: {
      halalCertified: true,
      halalType: "full",
      alcoholFree: true,
      prayerSpace: true,
      cuisine: ["Marocaine", "Méditerranéenne"],
      priceRange: "$$"
    },
    verified: true
  },
  {
    id: "2",
    name: "Piscine Oasis Femmes",
    slug: "piscine-oasis-femmes-bruxelles",
    category: "pool",
    address: "15 Avenue de la Liberté",
    city: "Bruxelles",
    coordinates: { lat: 50.8510, lng: 4.3525 },
    rating: 4.9,
    reviewCount: 89,
    isOpen: true,
    openingHours: "09:00 - 20:00",
    phone: "+32 2 987 65 43",
    image: "/pool1.jpg",
    metadata: {
      womenOnly: true,
      alcoholFree: true,
      wuduFacilities: true,
      amenities: ["Vestiaires privés", "Sauna", "Hammam"]
    },
    verified: true
  },
  {
    id: "3",
    name: "Boucherie El Halal",
    slug: "boucherie-el-halal-paris",
    category: "butcher",
    address: "78 Rue Jean-Pierre Timbaud",
    city: "Paris",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    rating: 4.8,
    reviewCount: 156,
    isOpen: false,
    openingHours: "08:00 - 19:30",
    phone: "+33 1 23 45 67 89",
    image: "/butcher1.jpg",
    metadata: {
      halalCertified: true,
      halalType: "full",
      alcoholFree: true
    },
    verified: true
  },
  {
    id: "4",
    name: "Mosquée Al-Imane",
    slug: "mosquee-al-imane-lyon",
    category: "mosque",
    address: "23 Rue de la Mosquée",
    city: "Lyon",
    coordinates: { lat: 45.7640, lng: 4.8357 },
    rating: 4.9,
    reviewCount: 312,
    isOpen: true,
    openingHours: "05:00 - 23:00",
    phone: "+33 4 12 34 56 78",
    image: "/mosque1.jpg",
    metadata: {
      prayerSpace: true,
      wuduFacilities: true,
      alcoholFree: true,
      amenities: ["Salle femmes", "Parking", "Bibliothèque"]
    },
    verified: true
  },
  {
    id: "5",
    name: "Hôtel Safir",
    slug: "hotel-safir-anvers",
    category: "hotel",
    address: "5 Keyzerlei",
    city: "Anvers",
    coordinates: { lat: 51.2194, lng: 4.4025 },
    rating: 4.5,
    reviewCount: 78,
    isOpen: true,
    openingHours: "24h/24",
    phone: "+32 3 234 56 78",
    website: "https://hotelsafir.be",
    image: "/hotel1.jpg",
    metadata: {
      halalCertified: true,
      halalType: "partial",
      alcoholFree: false,
      prayerSpace: true,
      familyFriendly: true,
      priceRange: "$$"
    },
    verified: false
  },
  {
    id: "6",
    name: "Épicerie Medina",
    slug: "epicerie-medina-bruxelles",
    category: "grocery",
    address: "33 Chaussée de Gand",
    city: "Bruxelles",
    coordinates: { lat: 50.8520, lng: 4.3480 },
    rating: 4.6,
    reviewCount: 45,
    isOpen: true,
    openingHours: "09:00 - 21:00",
    phone: "+32 2 456 78 90",
    image: "/grocery1.jpg",
    metadata: {
      halalCertified: true,
      halalType: "full",
      alcoholFree: true
    },
    verified: true
  }
];