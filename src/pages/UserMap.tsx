import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { journalService } from '../services/journal.service';
import { userService } from '../services/user.service';
import { MapView } from '../components/map/MapView';
import type { JournalEntry } from '../types/journal';
import type { Profile } from '../types/user';

export const UserMap = () => {
  const { username } = useParams<{ username: string }>();
  const { profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = authProfile?.username === username;

  useEffect(() => {
    const loadData = async () => {
      if (!username) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch user profile
        const userProfile = await userService.getProfileByUsername(username);
        if (!userProfile) {
          setError('User not found');
          setLoading(false);
          return;
        }
        setProfile(userProfile);

        // Fetch user's journal entries
        const data = await journalService.getUserJournalEntries(userProfile.id);
        console.log('Fetched entries for map:', data);
        console.log('Entries with coords:', data.filter(e => e.campground?.latitude && e.campground?.longitude));
        setEntries(data);
      } catch (err) {
        console.error('Error loading user map:', err);
        setError('Failed to load camping map');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-card p-6">
          <p className="text-red-800 mb-4">{error || 'User not found'}</p>
          <Link
            to={`/profile/${username}`}
            className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to profile
          </Link>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to={`/profile/${username}`}
            className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center transition-colors mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to profile
          </Link>
        </div>
        <div className="bg-white rounded-card shadow-soft p-12 text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-display font-semibold text-ink mb-2">
            No camping adventures yet
          </h3>
          <p className="text-base text-ink-light mb-6 leading-relaxed">
            {isOwnProfile
              ? "Start adding journal entries to see your camping map come to life!"
              : `${profile.username} hasn't added any camping adventures yet.`
            }
          </p>
          {isOwnProfile && (
            <a
              href="/search"
              className="inline-block px-6 py-3 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 transition-colors"
            >
              Find a Campground
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="mb-6">
        <Link
          to={`/profile/${username}`}
          className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to profile
        </Link>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-ink mb-2 tracking-tight">
          {isOwnProfile ? 'Your' : `${profile.username}'s`} Camping Map
        </h1>
        <p className="text-ink-light text-base">
          {entries.length} {entries.length === 1 ? 'location' : 'locations'} visited
        </p>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
        <MapView entries={entries} />
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-card shadow-soft p-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs">⛺</div>
            <span className="text-ink-light">Campground visited</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-ink-lighter">•</span>
            <span className="text-ink-light">Click a pin to see details</span>
          </div>
        </div>
      </div>
    </div>
  );
};
