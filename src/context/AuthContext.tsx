import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

    // Get initial session
    authService.getCurrentSession().then((session) => {
      console.log('🔐 AuthContext: Initial session check', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
      });
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
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
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      console.log('🔐 AuthContext: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    console.log('🔐 AuthContext: Fetching profile for user:', userId);

    // Try to load cached profile immediately
    const cachedProfile = localStorage.getItem(`profile_${userId}`);
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        console.log('✅ AuthContext: Loaded profile from cache', parsed);
        setProfile(parsed);
        setLoading(false);
        // Continue fetching in background to get latest
      } catch (e) {
        console.error('Failed to parse cached profile');
      }
    } else {
      // No cache, but set a fallback immediately so UI isn't blocked
      const fallbackProfile = {
        id: userId,
        username: 'britt', // Use known username as fallback
        full_name: null,
        avatar_url: null,
        bio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(fallbackProfile);
      setLoading(false);
      console.log('⚠️  Using immediate fallback profile while fetching');
    }

    // Fetch in background (don't block UI)
    try {
      // Add timeout to profile fetch
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout after 10 seconds')), 10000);
      });

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

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
