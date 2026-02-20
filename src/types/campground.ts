export interface Campground {
  id: string;
  google_place_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  google_rating: number | null;
  google_maps_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampgroundStats {
  id: string;
  name: string;
  total_visits: number;
  total_reviews: number;
  avg_rating: number;
  total_photos: number;
}

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  website?: string;
  formatted_phone_number?: string;
}
