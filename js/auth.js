// Supabase auth — loaded via vendor/supabase.js UMD → window.supabase
// Keys are intentionally public (anon key + OAuth client ID).
// All data is protected by Supabase Row Level Security policies.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

let _client = null;

const client = () => {
  if (!_client) {
    _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'pl.auth', // namespaced to avoid collision
      },
    });
  }
  return _client;
};

export const signUpEmail = async (email, password) => {
  const { data, error } = await client().auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
};

export const signInEmail = async (email, password) => {
  const { data, error } = await client().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
};

// Google OAuth — works on web; on native requires deep-link redirect setup
export const signInGoogle = async () => {
  const { error } = await client().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
  if (error) throw error;
};

export const signOut = async () => {
  const { error } = await client().auth.signOut();
  if (error) throw error;
};

export const getUser = async () => {
  const { data: { session }, error } = await client().auth.getSession();
  if (error) return null;
  return session?.user ?? null;
};

// Subscribe to auth state; returns the unsubscribe function
export const onAuthChange = (callback) => {
  const { data: { subscription } } = client().auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
};
