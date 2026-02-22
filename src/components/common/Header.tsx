import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

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

  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  };

  const testSupabaseConnection = async () => {
    console.log('🧪 TEST: Starting Supabase connection test...');
    console.log('🧪 TEST: User ID:', user?.id);
    console.log('🧪 TEST: Supabase client exists?', !!supabase);

    try {
      // Test 1: Super basic await
      console.log('🧪 TEST 1: Simple Promise.resolve test...');
      await Promise.resolve('basic promise works');
      console.log('✅ TEST 1: Basic promises work!');

      // Test 2: Auth session with timeout
      console.log('🧪 TEST 2: Checking auth session (8s timeout)...');
      const sessionResult = await withTimeout(
        Promise.resolve(supabase.auth.getSession()),
        8000
      );
      console.log('✅ TEST 2: Session check complete:', sessionResult);

      // Test 3: Count query with head: true (fastest possible)
      console.log('🧪 TEST 3: Trying follows COUNT query (8s timeout)...');
      const countResult = await withTimeout(
        Promise.resolve(supabase.from('follows').select('count', { count: 'exact', head: true })),
        8000
      );
      console.log('✅ TEST 3: Count query complete:', countResult);

      // Test 4: Simple select
      console.log('🧪 TEST 4: Trying simple follows select (8s timeout)...');
      const selectResult = await withTimeout(
        Promise.resolve(supabase.from('follows').select('following_id').limit(1)),
        8000
      );
      console.log('✅ TEST 4: Select query complete:', selectResult);

      alert(`All tests completed! Check console for details.`);
    } catch (err) {
      console.error('❌ TEST: Query failed:', err);
      console.error('❌ TEST: Error type:', typeof err);
      console.error('❌ TEST: Error constructor:', err?.constructor?.name);
      console.error('❌ TEST: Error keys:', err ? Object.keys(err) : 'null');
      console.error('❌ TEST: Error stringified:', JSON.stringify(err, null, 2));

      if (err instanceof Error) {
        console.error('❌ TEST: Error message:', err.message);
        console.error('❌ TEST: Error stack:', err.stack);
      }

      alert(`Query failed: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
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
                  to="/feed"
                  className="text-ink hover:text-brand-500 font-medium transition-colors"
                >
                  Feed
                </Link>
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
                  onClick={testSupabaseConnection}
                  className="px-3 py-1 bg-yellow-500 text-white font-medium rounded-button hover:bg-yellow-600 transition-colors text-xs"
                  title="Test Supabase Query"
                >
                  🧪 Test
                </button>
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
