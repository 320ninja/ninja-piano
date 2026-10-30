// Copy this file to config.js and fill in your real keys.
// config.js is gitignored — never commit it.
//
// Supabase anon key and RevenueCat public SDK key are SAFE for client apps:
//   - Supabase anon key: read-only, Row Level Security enforces per-user access
//   - RevenueCat public key: can only read/purchase for the current user

export const SUPABASE_URL        = 'https://YOUR_PROJECT_ID.supabase.co';
export const SUPABASE_ANON_KEY   = 'YOUR_SUPABASE_ANON_KEY';

export const RC_API_KEY_ANDROID  = 'YOUR_REVENUECAT_ANDROID_PUBLIC_KEY';
export const RC_ENTITLEMENT_ID   = 'premium'; // must match entitlement ID in RevenueCat dashboard
