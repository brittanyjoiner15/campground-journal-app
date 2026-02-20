import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export type SignUpData = {
  email: string;
  password: string;
  username: string;
  full_name?: string;
};

export type SignInData = {
  email: string;
  password: string;
};

export const authService = {
  async signUp({ email, password, username, full_name }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: full_name || '',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    console.log('🔐 authService: signOut called');
    console.log('🔐 authService: supabase client exists?', !!supabase);
    console.log('🔐 authService: supabase.auth exists?', !!supabase?.auth);
    console.log('🔐 authService: supabase.auth.signOut exists?', typeof supabase?.auth?.signOut);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Sign out timeout after 5 seconds')), 5000);
    });

    console.log('🔐 authService: About to call supabase.auth.signOut()...');
    const signOutPromise = supabase.auth.signOut();
    console.log('🔐 authService: signOut() returned a promise:', signOutPromise);

    try {
      console.log('🔐 authService: Waiting for promise to resolve...');
      const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any;
      if (error) {
        console.error('🔐 authService: signOut error:', error);
        throw error;
      }
      console.log('🔐 authService: signOut successful');
    } catch (err) {
      console.error('🔐 authService: signOut exception:', err);
      throw err;
    }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },
};
