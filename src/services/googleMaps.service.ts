import type { GooglePlaceResult } from '../types/campground';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let isLoading = false;
let isLoaded = false;

const loadGoogleMapsScript = (): Promise<void> => {
  if (isLoaded && window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (isLoading) {
    return new Promise((resolve) => {
      const checkLoaded = setInterval(() => {
        if (isLoaded && window.google?.maps?.places) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
    });
  }

  isLoading = true;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Wait for places library to be available
      const checkPlaces = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkPlaces);
          isLoaded = true;
          isLoading = false;
          resolve();
        }
      }, 50);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkPlaces);
        if (!window.google?.maps?.places) {
          isLoading = false;
          reject(new Error('Google Maps Places library failed to load'));
        }
      }, 5000);
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });
};

export const googleMapsService = {
  async searchCampgrounds(query: string): Promise<GooglePlaceResult[]> {
    await loadGoogleMapsScript();

    if (!window.google?.maps?.places) {
      throw new Error('Google Maps Places library not available');
    }

    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request = {
        query: `${query} campground OR RV park`,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'rating'],
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results as GooglePlaceResult[]);
        } else {
          reject(new Error(`Places search failed with status: ${status}`));
        }
      });
    });
  },

  async getCampgroundDetails(placeId: string) {
    await loadGoogleMapsScript();

    if (!window.google?.maps?.places) {
      throw new Error('Google Maps Places library not available');
    }

    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request = {
        placeId,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'geometry',
          'rating',
          'formatted_phone_number',
          'website',
          'photos',
          'url',
        ],
      };

      service.getDetails(request, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Place details failed with status: ${status}`));
        }
      });
    });
  },

  async initializeMap(
    container: HTMLElement,
    options: google.maps.MapOptions
  ): Promise<google.maps.Map> {
    await loadGoogleMapsScript();

    if (!window.google?.maps) {
      throw new Error('Google Maps library not available');
    }

    return new google.maps.Map(container, options);
  },

  async createMarker(
    map: google.maps.Map,
    options: google.maps.MarkerOptions
  ): Promise<google.maps.Marker> {
    await loadGoogleMapsScript();

    if (!window.google?.maps) {
      throw new Error('Google Maps library not available');
    }

    return new google.maps.Marker({ ...options, map });
  },
};

// Extend window type
declare global {
  interface Window {
    google: any;
  }
}
