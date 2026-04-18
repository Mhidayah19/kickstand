export interface PlacesAutocompleteSuggestion {
  placeId: string;
  name: string;
  address: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  openingHours: string | null;
  rating: number | null;
}

export interface AutocompleteParams {
  query: string;
  lat?: number;
  lng?: number;
  sessionToken: string;
}
