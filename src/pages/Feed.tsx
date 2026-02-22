import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { journalService } from '../services/journal.service';
import { JournalCard } from '../components/journal/JournalCard';
import { UserSearchBar } from '../components/social/UserSearchBar';
import { getInitials } from '../utils/helpers';
import { CampingLoader } from '../components/common/CampingLoader';
import type { JournalEntryWithProfile } from '../types/journal';

export const Feed = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntryWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFeed = async () => {
      if (!user) {
        console.log('📰 Feed: No user yet, skipping load');
        setLoading(false);
        return;
      }

      console.log('📰 Feed: Loading feed for user:', user.id);
      try {
        setLoading(true);
        console.log('📰 Feed: About to call journalService.getFeedEntries...');
        const feedEntries = await journalService.getFeedEntries(user.id);
        console.log('✅ Feed: Loaded', feedEntries.length, 'entries');
        setEntries(feedEntries);
      } catch (err) {
        console.error('❌ Feed: Error loading feed:', err);
        setError('Failed to load feed');
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [user?.id]); // Use user.id instead of user object

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <CampingLoader message="Loading adventures" size="medium" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-ink mb-4 tracking-tight">
          Your Feed
        </h1>

        {/* Search Bar */}
        <div className="max-w-md mb-6">
          <UserSearchBar />
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-card shadow-soft p-12 text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🌲</div>
          <h3 className="text-xl font-display font-semibold text-ink mb-2">
            Follow users to see their adventures
          </h3>
          <p className="text-base text-ink-light mb-6 leading-relaxed">
            Search for users above and follow them to see their campground journal entries in your feed.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <div key={entry.id} className="relative">
              {/* User Attribution */}
              {entry.profile && (
                <Link
                  to={`/profile/${entry.profile.username}`}
                  className="flex items-center gap-2 mb-3 group"
                >
                  {entry.profile.avatar_url ? (
                    <img
                      src={entry.profile.avatar_url}
                      alt={entry.profile.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-sand-200 group-hover:border-brand-500 transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center border-2 border-brand-200 group-hover:border-brand-600 transition-colors">
                      <span className="text-xs font-bold text-white">
                        {getInitials(entry.profile.full_name || entry.profile.username)}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-ink group-hover:text-brand-500 transition-colors">
                    {entry.profile.full_name || entry.profile.username}
                  </span>
                </Link>
              )}

              <JournalCard entry={entry} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
