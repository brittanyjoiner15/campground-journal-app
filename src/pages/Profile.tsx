import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user.service';
import { journalService } from '../services/journal.service';
import { followService } from '../services/follow.service';
import { storageService } from '../services/storage.service';
import { JournalCard } from '../components/journal/JournalCard';
import { FollowButton } from '../components/social/FollowButton';
import { EditProfileForm } from '../components/profile/EditProfileForm';
import type { Profile as ProfileType } from '../types/user';
import type { JournalEntry } from '../types/journal';
import type { FollowStats } from '../types/follow';
import { getInitials } from '../utils/helpers';

export const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState({ totalCampgrounds: 0, totalPhotos: 0 });
  const [followStats, setFollowStats] = useState<FollowStats>({ followerCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingJournal, setLoadingJournal] = useState(true);
  const [error, setError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      // Check if viewing own profile - use cached data!
      const isOwnProfile = authProfile?.username === username;

      if (isOwnProfile && authProfile && user) {
        console.log('✅ Using cached profile data for own profile');
        setProfile(authProfile);

        // Try to load cached journal entries
        const cachedEntries = localStorage.getItem(`journal_${user.id}`);
        let hasCachedData = false;
        if (cachedEntries) {
          try {
            setJournalEntries(JSON.parse(cachedEntries));
            setLoadingJournal(false); // Have cached data
            hasCachedData = true;
          } catch (e) {
            console.error('Failed to parse cached journal');
          }
        }

        // Fetch journal entries in background (only show loading if no cache)
        if (!hasCachedData) {
          setLoadingJournal(true);
        }
        journalService.getUserJournalEntries(user.id, true) // Include drafts for own profile
          .then(entries => {
            setJournalEntries(entries);
            localStorage.setItem(`journal_${user.id}`, JSON.stringify(entries));
            setLoadingJournal(false);
          })
          .catch(err => {
            console.error('Background journal fetch failed:', err);
            setLoadingJournal(false);
          });

        // Calculate stats from cached entries
        const cachedStats = localStorage.getItem(`stats_${user.id}`);
        if (cachedStats) {
          try {
            setStats(JSON.parse(cachedStats));
          } catch (e) {
            console.error('Failed to parse cached stats');
          }
        }

        // Fetch stats in background
        userService.getUserStats(user.id)
          .then(userStats => {
            setStats(userStats);
            localStorage.setItem(`stats_${user.id}`, JSON.stringify(userStats));
          })
          .catch(err => console.error('Background stats fetch failed:', err));

        // Fetch follow stats
        followService.getFollowStats(user.id)
          .then(setFollowStats)
          .catch(err => console.error('Background follow stats fetch failed:', err));

        setLoading(false);
        return;
      }

      // Viewing someone else's profile - need to fetch
      console.log(`📱 Viewing profile: ${username} (other user's profile)`);
      try {
        setLoading(true);
        setLoadingJournal(true);
        setError('');

        const userProfile = await userService.getProfileByUsername(username);

        if (!userProfile) {
          setError('User not found');
          setLoading(false);
          setLoadingJournal(false);
          return;
        }

        console.log(`✅ Profile loaded: ${userProfile.username}`);
        setProfile(userProfile);

        console.log(`📖 Fetching journal entries for user: ${userProfile.id}`);
        const entries = await journalService.getUserJournalEntries(userProfile.id, false); // Only published for other users
        console.log(`✅ Journal entries loaded: ${entries.length} entries`);
        setJournalEntries(entries);

        const userStats = await userService.getUserStats(userProfile.id);
        setStats(userStats);

        const userFollowStats = await followService.getFollowStats(userProfile.id);
        setFollowStats(userFollowStats);

      } catch (err) {
        console.error('❌ Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
        setLoadingJournal(false);
      }
    };

    loadProfile();
  }, [username]); // Only depend on username to prevent infinite loop from object recreation

  const handleFollowChange = async () => {
    if (!profile) return;
    try {
      const newStats = await followService.getFollowStats(profile.id);
      setFollowStats(newStats);
    } catch (err) {
      console.error('Error refreshing follow stats:', err);
    }
  };

  const handleUpdateProfile = async (data: {
    full_name: string;
    bio: string;
    website: string;
    avatar?: File;
  }) => {
    if (!user || !profile) return;

    try {
      let avatarUrl = profile.avatar_url;

      // Upload avatar if provided
      if (data.avatar) {
        const { url } = await storageService.uploadAvatar(data.avatar, user.id);
        avatarUrl = url;
      }

      // Update profile
      const updatedProfile = await userService.updateProfile(user.id, {
        full_name: data.full_name,
        bio: data.bio,
        website: data.website,
        avatar_url: avatarUrl,
      });

      setProfile(updatedProfile);
      setIsEditingProfile(false);
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Edit Profile Modal */}
      {isEditingProfile && profile && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <EditProfileForm
              profile={profile}
              onSubmit={handleUpdateProfile}
              onCancel={() => setIsEditingProfile(false)}
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-card shadow-card p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-sand-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-500 flex items-center justify-center border-4 border-brand-200">
                <span className="text-3xl font-bold text-white">
                  {getInitials(profile.full_name || profile.username)}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-ink mb-1">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-ink-lighter mb-4 text-base">@{profile.username}</p>
              </div>
              <div className="flex gap-2">
                {authProfile?.username === profile.username ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-6 py-2 bg-sand-200 text-ink rounded-button font-medium hover:bg-sand-300 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <FollowButton userId={profile.id} onFollowChange={handleFollowChange} />
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="text-ink-light mb-2 leading-relaxed">{profile.bio}</p>
            )}

            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 font-medium text-sm mb-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {profile.website.replace(/^https?:\/\//i, '')}
              </a>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-pine-50 rounded-button border border-pine-200">
                <span className="text-2xl">🏕️</span>
                <div>
                  <div className="text-2xl font-display font-bold text-pine-700">{stats.totalCampgrounds}</div>
                  <div className="text-xs text-pine-600 font-medium">
                    {stats.totalCampgrounds === 1 ? 'Campground' : 'Campgrounds'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 bg-brand-50 rounded-button border border-brand-200">
                <span className="text-2xl">📸</span>
                <div>
                  <div className="text-2xl font-display font-bold text-brand-700">{stats.totalPhotos}</div>
                  <div className="text-xs text-brand-600 font-medium">
                    {stats.totalPhotos === 1 ? 'Photo' : 'Photos'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 bg-sky-50 rounded-button border border-sky-200">
                <span className="text-2xl">👥</span>
                <div>
                  <div className="text-2xl font-display font-bold text-sky-700">{followStats.followerCount}</div>
                  <div className="text-xs text-sky-600 font-medium">
                    {followStats.followerCount === 1 ? 'Follower' : 'Followers'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-button border border-purple-200">
                <span className="text-2xl">🌟</span>
                <div>
                  <div className="text-2xl font-display font-bold text-purple-700">{followStats.followingCount}</div>
                  <div className="text-xs text-purple-600 font-medium">Following</div>
                </div>
              </div>
            </div>

            {/* Map Link */}
            {stats.totalCampgrounds > 0 && (
              <Link
                to={`/profile/${profile.username}/map`}
                className="mt-4 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-button hover:from-brand-600 hover:to-brand-700 transition-all shadow-md hover:shadow-lg"
              >
                <span className="text-2xl">🗺️</span>
                <div className="flex-1">
                  <div className="font-semibold">
                    {authProfile?.username === profile.username ? 'View Your Camping Map' : `View ${profile.username}'s Camping Map`}
                  </div>
                  <div className="text-xs text-white/90">
                    {authProfile?.username === profile.username ? 'See all your adventures on a map' : 'See where they\'ve camped'}
                  </div>
                </div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Journal Entries */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-ink">
            {authProfile?.username === profile.username ? 'My' : `${profile.username}'s`} Travel Journal
          </h2>
          {authProfile?.username === profile.username && (
            <Link
              to="/journal"
              className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
            >
              View All →
            </Link>
          )}
        </div>

        {loadingJournal ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-500 border-t-transparent"></div>
          </div>
        ) : journalEntries.length === 0 ? (
          <div className="bg-white border border-sand-200 rounded-card shadow-soft p-12 text-center">
            <p className="text-ink-light">No journal entries yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journalEntries.map((entry) => (
              <JournalCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
};
