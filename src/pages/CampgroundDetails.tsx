import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { googleMapsService } from '../services/googleMaps.service';
import { campgroundService } from '../services/campground.service';
import { journalService } from '../services/journal.service';
import { storageService } from '../services/storage.service';
import { useAuth } from '../context/AuthContext';
import { JournalEntryForm } from '../components/journal/JournalEntryForm';
import { CampgroundVisitors } from '../components/campground/CampgroundVisitors';
import { JournalCard } from '../components/journal/JournalCard';
import type { Campground } from '../types/campground';
import type { Profile } from '../types/user';
import type { JournalEntryWithProfile } from '../types/journal';

export const CampgroundDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>(null);
  const [campground, setCampground] = useState<Campground | null>(null);
  const [visitors, setVisitors] = useState<Profile[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntryWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSocial, setLoadingSocial] = useState(true);
  const [error, setError] = useState('');
  const [showJournalForm, setShowJournalForm] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log('Already loading, skipping...');
      return;
    }

    const loadDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      loadingRef.current = true;
      setLoading(true);
      setError('');
      console.log('Loading campground details for:', id);

      try {
        const placeDetails = await googleMapsService.getCampgroundDetails(id);
        console.log('Place details loaded:', placeDetails);

        // Set details and stop loading IMMEDIATELY
        setDetails(placeDetails as any);
        setLoading(false);
        loadingRef.current = false;
        console.log('Details displayed!');

        // Save to database in background (don't wait)
        if (user) {
          console.log('Saving to database in background...');
          const details = placeDetails as any;
          const addressComponents = details.formatted_address?.split(', ') || [];

          campgroundService.getOrCreateCampground(id, {
            google_place_id: id,
            name: details.name || 'Unknown',
            address: details.formatted_address || null,
            city: addressComponents[addressComponents.length - 3] || null,
            state: addressComponents[addressComponents.length - 2] || null,
            country: addressComponents[addressComponents.length - 1] || null,
            latitude: details.geometry?.location?.lat?.() || null,
            longitude: details.geometry?.location?.lng?.() || null,
            phone: details.formatted_phone_number || null,
            website: details.website || null,
            google_rating: details.rating || null,
            google_maps_url: details.url || null,
          }).then((saved) => {
            console.log('Campground saved to database successfully');
            setCampground(saved);

            // Load social data once we have the campground ID
            loadSocialData(saved.id);
          }).catch((dbError) => {
            console.error('Database save failed (non-critical):', dbError);
          });
        } else {
          // If campground already exists, load social data
          campgroundService.getCampgroundByGooglePlaceId(id)
            .then((existing) => {
              if (existing) {
                loadSocialData(existing.id);
              }
            })
            .catch((err) => console.error('Error fetching existing campground:', err));
        }
      } catch (err) {
        console.error('Error loading campground details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load details');
        setLoading(false);
        loadingRef.current = false;
      }
    };

    loadDetails();

    // Cleanup function
    return () => {
      loadingRef.current = false;
    };
  }, [id, user]);

  const loadSocialData = async (campgroundId: string) => {
    try {
      setLoadingSocial(true);
      const [visitorsData, entriesData] = await Promise.all([
        campgroundService.getCampgroundVisitors(campgroundId),
        campgroundService.getCampgroundJournalEntries(campgroundId),
      ]);
      setVisitors(visitorsData as Profile[]);
      setJournalEntries(entriesData as JournalEntryWithProfile[]);
    } catch (err) {
      console.error('Error loading social data:', err);
    } finally {
      setLoadingSocial(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-500 border-t-transparent mb-4"></div>
          <p className="text-ink-light">Loading campground details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-card p-6">
          <p className="text-red-800 font-semibold mb-2">Error loading campground</p>
          <p className="text-red-700 mb-4">{error}</p>
          <Link to="/search" className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-sand-100 border border-sand-300 rounded-card p-6">
          <p className="text-ink mb-4">Campground not found</p>
          <Link to="/search" className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="mb-6">
        <Link to="/search" className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to search
        </Link>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-sand-200">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-4xl">🏕️</span>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-ink mb-2 leading-tight">{details.name}</h1>
              <p className="text-ink-light leading-relaxed">{details.formatted_address}</p>
            </div>
          </div>
          {details.rating && (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-brand-50 rounded-badge border border-brand-200">
              <span className="text-brand-500">⭐</span>
              <span className="font-medium text-brand-700">{details.rating}</span>
              <span className="text-sm text-brand-600">Google rating</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 md:p-8 space-y-5">
          {details.formatted_phone_number && (
            <div>
              <h3 className="text-xs font-semibold text-ink-lighter uppercase tracking-wide mb-1">Phone</h3>
              <a href={`tel:${details.formatted_phone_number}`} className="text-base text-ink hover:text-brand-500 transition-colors">
                {details.formatted_phone_number}
              </a>
            </div>
          )}

          {details.website && (
            <div>
              <h3 className="text-xs font-semibold text-ink-lighter uppercase tracking-wide mb-1">Website</h3>
              <a
                href={details.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-brand-500 hover:text-brand-600 break-all transition-colors"
              >
                {details.website}
              </a>
            </div>
          )}

          {details.url && (
            <div>
              <a
                href={details.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 font-medium transition-colors"
              >
                <span>View on Google Maps</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          {/* Visitors */}
          {!loadingSocial && visitors.length > 0 && (
            <div className="pt-4 border-t border-sand-200">
              <CampgroundVisitors visitors={visitors} />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {user && details && (
          <div className="p-6 md:p-8 bg-sand-50 border-t border-sand-200">
            <button
              onClick={() => setShowJournalForm(true)}
              className="w-full px-6 py-4 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all hover:shadow-md active:scale-98"
            >
              Add to Travel Journal
            </button>
            <p className="text-sm text-ink-light mt-3 text-center leading-relaxed">
              Log your visit and collect memories from this campground
            </p>
          </div>
        )}
      </div>

      {/* Journal Entries from Other Users */}
      {!loadingSocial && journalEntries.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-ink mb-6">
            Camper Stories ({journalEntries.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journalEntries.map((entry) => (
              <JournalCard key={entry.id} entry={entry} showProfile showCampground={false} />
            ))}
          </div>
        </div>
      )}

      {/* Journal Entry Modal */}
      {showJournalForm && details && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <JournalEntryForm
              campground={{
                id: campground?.id || '',
                google_place_id: id!,
                name: details.name || 'Unknown',
                address: details.formatted_address || null,
                city: null,
                state: null,
                country: null,
                latitude: details.geometry?.location?.lat?.() || null,
                longitude: details.geometry?.location?.lng?.() || null,
                phone: details.formatted_phone_number || null,
                website: details.website || null,
                google_rating: details.rating || null,
                google_maps_url: details.url || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }}
              onSubmit={async (data) => {
                try {
                  if (!user || !id) {
                    throw new Error('User or campground ID missing');
                  }

                  console.log('Starting journal entry save...');

                  // Ensure campground is saved first
                  let campgroundId = campground?.id;
                  if (!campgroundId) {
                    console.log('Saving campground to database first...');
                    const addressComponents = details.formatted_address?.split(', ') || [];
                    const saved = await campgroundService.getOrCreateCampground(id, {
                      google_place_id: id,
                      name: details.name || 'Unknown',
                      address: details.formatted_address || null,
                      city: addressComponents[addressComponents.length - 3] || null,
                      state: addressComponents[addressComponents.length - 2] || null,
                      country: addressComponents[addressComponents.length - 1] || null,
                      latitude: details.geometry?.location?.lat?.() || null,
                      longitude: details.geometry?.location?.lng?.() || null,
                      phone: details.formatted_phone_number || null,
                      website: details.website || null,
                      google_rating: details.rating || null,
                      google_maps_url: details.url || null,
                    });
                    console.log('Campground saved:', saved);
                    campgroundId = saved.id;
                  }

                  console.log('Creating journal entry with campground_id:', campgroundId);
                  const journalEntry = await journalService.createJournalEntry(user.id, {
                    campground_id: campgroundId,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    notes: data.notes,
                    is_favorite: data.is_favorite,
                  });
                  console.log('Journal entry created successfully!', journalEntry);

                  // Upload photos if any
                  if (data.photos && data.photos.length > 0) {
                    console.log(`Uploading ${data.photos.length} photos...`);

                    for (const photo of data.photos) {
                      try {
                        // Upload to storage
                        const { path, url } = await storageService.uploadPhoto(
                          photo,
                          user.id,
                          campgroundId
                        );

                        // Save photo record
                        await storageService.savePhotoRecord(
                          user.id,
                          campgroundId,
                          journalEntry.id,
                          path,
                          url
                        );

                        console.log('Photo uploaded:', url);
                      } catch (photoError) {
                        console.error('Error uploading photo:', photoError);
                        // Continue with other photos even if one fails
                      }
                    }

                    console.log('All photos uploaded!');
                  }

                  // Share with friend if selected
                  if (data.shareWithUser) {
                    try {
                      console.log('Sharing entry with:', data.shareWithUser.username);
                      await journalService.shareJournalEntry(
                        journalEntry.id,
                        data.shareWithUser.id,
                        user.id
                      );
                      console.log('Entry shared successfully!');
                    } catch (shareError) {
                      console.error('Error sharing:', shareError);
                      alert(`Failed to share: ${shareError instanceof Error ? shareError.message : 'Unknown error'}`);
                      // Don't fail the whole operation if sharing fails
                    }
                  }

                  setShowJournalForm(false);
                  navigate('/journal');
                } catch (error) {
                  console.error('Error saving journal entry:', error);
                  throw error; // Re-throw to let form handle it
                }
              }}
              onCancel={() => setShowJournalForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
