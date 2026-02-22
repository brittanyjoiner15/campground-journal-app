import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';
import type { SignUpData, SignInData } from '../services/auth.service';
import { supabase } from '../services/supabase';
import type { Profile } from '../types/user';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Check localStorage IMMEDIATELY for cached session (instant, no network)
  const getCachedSession = () => {
    try {
      const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.includes('-auth-token'));
      if (key) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          return parsed?.currentSession?.user || null;
        }
      }
    } catch (e) {
      console.error('Failed to parse cached session:', e);
    }
    return null;
  };

  const cachedUser = getCachedSession();
  const [user, setUser] = useState<User | null>(cachedUser); // Start with cached user!
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!cachedUser); // Only loading if no cached user
  const [hasInitialized, setHasInitialized] = useState(false);

  // Log auth state changes
  useEffect(() => {
    console.log('🔐 AuthContext: Current state', {
      isLoggedIn: !!user,
      userId: user?.id,
      email: user?.email,
      hasProfile: !!profile,
      loading,
    });
  }, [user, profile, loading]);

  useEffect(() => {
    console.log('🔐 AuthContext: Initializing...');

    // If we have a cached user, load profile immediately (non-blocking)
    if (cachedUser) {
      console.log('🔐 AuthContext: Using cached user, fetching profile in background');
      fetchProfile(cachedUser.id);
    }

    // Validate session in background (don't block UI)
    authService.getCurrentSession().then((session) => {
      console.log('🔐 AuthContext: Background session validation', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
      });

      // Only update if session changed
      if (session?.user?.id !== user?.id) {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
      }

      setHasInitialized(true);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AuthContext: Auth state changed', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
        });

        // Skip the initial SIGNED_IN event if we already initialized
        if (event === 'SIGNED_IN' && hasInitialized) {
          console.log('🔐 AuthContext: Skipping duplicate SIGNED_IN event');
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
        setHasInitialized(true);
      }
    );

    return () => {
      console.log('🔐 AuthContext: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    console.log('🔐 AuthContext: Fetching profile for user:', userId);

    // ALWAYS set loading to false immediately - don't block UI
    setLoading(false);

    // Try to load cached profile immediately
    const cachedProfile = localStorage.getItem(`profile_${userId}`);
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        console.log('✅ AuthContext: Loaded profile from cache (instant)', parsed);
        setProfile(parsed);
        // Continue fetching in background to get latest
      } catch (e) {
        console.error('Failed to parse cached profile');
      }
    }

    // Fetch in background (don't block UI)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      console.log('🔐 AuthContext: Profile fetched successfully from database', data);
      setProfile(data);

      // Cache the profile
      localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('❌ AuthContext: Error fetching profile (using fallback):', error);
      // We already set a fallback profile above, so just log the error
    }
  };

  const signUp = async (data: SignUpData) => {
    console.log('🔐 AuthContext: Signing up user:', data.email);
    try {
      await authService.signUp(data);
      console.log('✅ AuthContext: Sign up successful');
    } catch (error) {
      console.error('❌ AuthContext: Sign up failed:', error);
      throw error;
    }
  };

  const signIn = async (data: SignInData) => {
    console.log('🔐 AuthContext: Signing in user:', data.email);
    try {
      await authService.signIn(data);
      console.log('✅ AuthContext: Sign in successful');
    } catch (error) {
      console.error('❌ AuthContext: Sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🔐 AuthContext: Signing out...');
    try {
      await authService.signOut();
      console.log('✅ AuthContext: Server sign out successful');
    } catch (error) {
      console.error('❌ AuthContext: Server sign out failed (timeout or error):', error);
      console.log('⚠️  AuthContext: Clearing local session anyway...');
    } finally {
      // Always clear local state, even if server sign-out fails
      setUser(null);
      setProfile(null);
      console.log('✅ AuthContext: Local session cleared');
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
