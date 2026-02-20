import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-sand-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-3xl group-hover:scale-110 transition-transform">🏕️</span>
            <span className="text-xl font-display font-bold text-ink">CampJournal</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/search"
              className="text-ink hover:text-brand-500 font-medium transition-colors"
            >
              Explore
            </Link>

            {user ? (
              <>
                <Link
                  to="/journal"
                  className="text-ink hover:text-brand-500 font-medium transition-colors"
                >
                  My Journal
                </Link>
                <Link
                  to={`/profile/${profile?.username}`}
                  className="text-ink hover:text-brand-500 font-medium transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-ink hover:text-brand-500 font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile: Just show sign out or login */}
          <div className="md:hidden">
            {user ? (
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-ink-lighter hover:text-brand-500 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-ink-lighter hover:text-brand-500 transition-colors"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
