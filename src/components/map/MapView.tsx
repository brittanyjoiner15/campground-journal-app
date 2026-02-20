import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleMapsService } from '../../services/googleMaps.service';
import type { JournalEntry } from '../../types/journal';
import { formatDate } from '../../utils/helpers';

interface MapViewProps {
  entries: JournalEntry[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export const MapView = ({ entries, center, zoom = 4 }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        const validEntries = entries.filter(e => e.campground?.latitude && e.campground?.longitude);

        // Calculate center and initial zoom
        const hasValidEntries = validEntries.length > 0;
        const mapCenter = center || calculateCenter(entries);
        const initialZoom = hasValidEntries && !center ? 4 : zoom;

        // Initialize map (this will load Google Maps script if needed)
        const map = await googleMapsService.initializeMap(mapRef.current!, {
      center: mapCenter,
      zoom: initialZoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
      restriction: {
        latLngBounds: {
          north: 71.5,
          south: 14.5,
          west: -168.0,
          east: -52.0,
        },
        strictBounds: false,
      },
      minZoom: 3,
    });

    mapInstanceRef.current = map;
    setLoading(false);

    // Create info window
    infoWindowRef.current = new google.maps.InfoWindow();

    // Add markers for each entry
    validEntries.forEach((entry) => {
      const marker = new google.maps.Marker({
        position: {
          lat: Number(entry.campground!.latitude),
          lng: Number(entry.campground!.longitude),
        },
        map: map,
        title: entry.campground!.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.163 24.837 0 16 0z" fill="#F25C2A"/>
              <circle cx="16" cy="15" r="6" fill="white"/>
              <text x="16" y="19" font-size="12" text-anchor="middle" fill="#F25C2A" font-family="Arial, sans-serif">⛺</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 40),
          anchor: new google.maps.Point(16, 40),
        },
        animation: google.maps.Animation.DROP,
      });

      // Create info window content
      const infoContent = createInfoWindowContent(entry);

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(map, marker);

          // Add click listener to the info window after it opens
          google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
            const viewButton = document.getElementById(`view-entry-${entry.id}`);
            if (viewButton) {
              viewButton.addEventListener('click', () => {
                navigate(`/journal-entry/${entry.id}`);
              });
            }
          });
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers if we have multiple entries
    if (validEntries.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      validEntries.forEach((entry) => {
        bounds.extend({
          lat: Number(entry.campground!.latitude),
          lng: Number(entry.campground!.longitude),
        });
      });
      map.fitBounds(bounds);

      // Add padding so pins aren't at the edge
      google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        const currentZoom = map.getZoom();
        if (currentZoom && currentZoom > 12) {
          map.setZoom(12); // Don't zoom in too much
        }
      });
      }
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize map');
        setLoading(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [entries, center, zoom, navigate]);

  const calculateCenter = (entries: JournalEntry[]) => {
    const validEntries = entries.filter(
      (e) => e.campground?.latitude && e.campground?.longitude
    );

    if (validEntries.length === 0) {
      return { lat: 39.8283, lng: -98.5795 }; // Center of USA
    }

    const avgLat =
      validEntries.reduce((sum, e) => sum + Number(e.campground!.latitude), 0) /
      validEntries.length;
    const avgLng =
      validEntries.reduce((sum, e) => sum + Number(e.campground!.longitude), 0) /
      validEntries.length;

    return { lat: avgLat, lng: avgLng };
  };

  const createInfoWindowContent = (entry: JournalEntry) => {
    const photoUrl = entry.photos?.[0]?.public_url;

    return `
      <div style="max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
        ${photoUrl ? `
          <img
            src="${photoUrl}"
            alt="${entry.campground?.name}"
            style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;"
          />
        ` : ''}
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #2D2821;">
          ${entry.campground?.name || 'Unknown Campground'}
        </h3>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B6560;">
          📅 ${entry.start_date === entry.end_date
            ? formatDate(entry.start_date, 'MMM d, yyyy')
            : `${formatDate(entry.start_date, 'MMM d')} - ${formatDate(entry.end_date, 'MMM d, yyyy')}`
          }
        </p>
        ${entry.notes ? `
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #2D2821; line-height: 1.4; max-height: 60px; overflow: hidden;">
            ${entry.notes.substring(0, 100)}${entry.notes.length > 100 ? '...' : ''}
          </p>
        ` : ''}
        ${entry.is_favorite ? '<span style="font-size: 13px;">⭐ Favorite</span><br/>' : ''}
        <button
          id="view-entry-${entry.id}"
          style="margin-top: 8px; padding: 8px 16px; background: #F25C2A; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; width: 100%;"
        >
          View Full Entry
        </button>
      </div>
    `;
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-card overflow-hidden" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-sand-50">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-500 border-t-transparent"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center p-6">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-red-800 font-semibold mb-1">Map Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
