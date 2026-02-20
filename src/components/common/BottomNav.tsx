import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const BottomNav = () => {
  const location = useLocation();
  const { user, profile } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user) {
    return null; // Don't show bottom nav if not logged in
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-sand-200 shadow-soft safe-area-bottom z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {/* Search */}
        <Link
          to="/search"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-150 relative ${
            isActive('/search')
              ? 'text-brand-500'
              : 'text-ink-lighter'
          }`}
        >
          {isActive('/search') && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-500 rounded-b-full"></div>
          )}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs mt-1">Search</span>
        </Link>

        {/* Feed */}
        <Link
          to="/feed"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-150 relative ${
            isActive('/feed')
              ? 'text-brand-500'
              : 'text-ink-lighter'
          }`}
        >
          {isActive('/feed') && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-500 rounded-b-full"></div>
          )}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xs mt-1">Feed</span>
        </Link>

        {/* Profile */}
        {profile?.username ? (
          <Link
            to={`/profile/${profile.username}`}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-150 relative ${
              isActive('/profile')
                ? 'text-brand-500'
                : 'text-ink-lighter'
            }`}
          >
            {isActive('/profile') && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-500 rounded-b-full"></div>
            )}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </Link>
        ) : (
          <button
            disabled
            className="flex flex-col items-center justify-center flex-1 h-full text-sand-400 cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </button>
        )}
      </div>
    </nav>
  );
};
