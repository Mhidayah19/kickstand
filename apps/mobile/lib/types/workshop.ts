export interface Workshop {
  id: string;
  googlePlaceId: string | null;
  name: string;
  address: string;
  lat: string;
  lng: string;
  phone: string | null;
  rating: string | null;
  openingHours: string | null;
}

export interface WorkshopSuggestion {
  placeId: string;
  name: string;
  address: string;
}

export interface WorkshopSelection {
  id: string;
  name: string;
  address: string | null;
}
