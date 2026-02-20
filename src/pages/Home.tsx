import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-50 via-sand-50 to-pine-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4 tracking-tight">
            Your RV & Camping Passport
          </h1>
          <p className="text-lg md:text-xl text-ink-light mb-8 max-w-2xl mx-auto leading-relaxed">
            Log your campground visits, collect memories, and track your adventures across the country.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <>
                <Link
                  to="/search"
                  className="px-8 py-4 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 transition-all hover:shadow-md active:scale-98"
                >
                  Explore Campgrounds
                </Link>
                <Link
                  to="/journal"
                  className="px-8 py-4 bg-white text-ink font-medium rounded-button border-2 border-sand-300 hover:border-brand-300 hover:bg-sand-50 transition-all"
                >
                  My Travel Journal
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-brand-500 text-white font-medium rounded-button hover:bg-brand-600 transition-all hover:shadow-md active:scale-98"
                >
                  Start Your Journey
                </Link>
                <Link
                  to="/search"
                  className="px-8 py-4 bg-white text-ink font-medium rounded-button border-2 border-sand-300 hover:border-brand-300 hover:bg-sand-50 transition-all"
                >
                  Browse Campgrounds
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center text-ink mb-8 md:mb-12">
            Your Travel Companion
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="text-xl font-semibold mb-2 text-ink">Discover Campgrounds</h3>
              <p className="text-ink-light leading-relaxed">
                Search thousands of campgrounds and RV parks across the country
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📔</div>
              <h3 className="text-xl font-semibold mb-2 text-ink">Build Your Passport</h3>
              <p className="text-ink-light leading-relaxed">
                Log visits, add notes, and upload photos to create lasting memories
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2 text-ink">Track Favorites</h3>
              <p className="text-ink-light leading-relaxed">
                Mark your favorite spots and share your experiences with the community
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
