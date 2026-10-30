// Google Play Billing via cordova-plugin-purchase.
// Premium status is verified server-side (Supabase Edge Function) and
// cached in Supabase — defaults to DENY on any error or network failure.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const PRODUCTS = {
  weekly:  'piano_learners_premium_weekly',
  monthly: 'piano_learners_premium_monthly',
};
const VERIFY_URL = `${SUPABASE_URL}/functions/v1/verify-purchase`;

let _premiumStatus = false; // DENY by default
let _userId        = null;
let _sb            = null;

const _getSupabase = () => {
  if (!_sb && window.supabase) _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _sb;
};

// Call once after sign-in. Safe to call on web (no-op).
export const initPremium = async (userId) => {
  _userId = userId;
  _premiumStatus = false;
  try {
    await refreshPremiumStatus();
    _initStore(); // warm up the billing store in background
  } catch (_) {
    _premiumStatus = false;
  }
};

// Re-query Supabase for current premium status.
export const refreshPremiumStatus = async () => {
  if (!_userId) return;
  try {
    const sb = _getSupabase();
    if (!sb) return;
    const { data, error } = await sb
      .from('premium_users')
      .select('is_active, expires_at')
      .eq('user_id', _userId)
      .single();
    if (error || !data) { _premiumStatus = false; return; }
    const notExpired = !data.expires_at || new Date(data.expires_at) > new Date();
    _premiumStatus = !!(data.is_active && notExpired);
  } catch (_) {
    _premiumStatus = false; // network failure → deny
  }
};

// Synchronous — updated by init/refresh. Use in UI rendering.
export const isPremium = () => _premiumStatus;

// Detect platform at runtime so the same code works on Android and iOS.
const _platform = () => {
  const CdvPurchase = window.CdvPurchase;
  if (!CdvPurchase) return null;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return CdvPurchase.Platform.GOOGLE_PLAY;
  if (/iphone|ipad|ipod/i.test(ua)) return CdvPurchase.Platform.APPLE_APPSTORE;
  return null;
};

// Register all products and initialise the store (idempotent).
const _initStore = () => {
  const CdvPurchase = window.CdvPurchase;
  if (!CdvPurchase?.store) return; // web or plugin not loaded
  const platform = _platform();
  if (!platform) return;
  CdvPurchase.store.register(Object.values(PRODUCTS).map((id) => ({
    id,
    type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
    platform,
  })));
  CdvPurchase.store.initialize([platform]).catch(() => {});
};

// Open Google Play purchase sheet. plan: 'weekly' | 'monthly'
export const purchasePremium = (plan = 'monthly') => new Promise((resolve, reject) => {
  const CdvPurchase = window.CdvPurchase;
  if (!CdvPurchase?.store) {
    reject(new Error('In-app purchases are not available on this platform.'));
    return;
  }
  const productId = PRODUCTS[plan] || PRODUCTS.monthly;

  const platform = _platform();
  if (!platform) { reject(new Error('In-app purchases are not available on this platform.')); return; }

  const unsub = CdvPurchase.store.when().approved(async (tx) => {
    unsub();
    try {
      await _verifyWithServer(tx.purchaseId || tx.transactionId, productId);
      await tx.finish();
      await refreshPremiumStatus();
      resolve(_premiumStatus);
    } catch (e) {
      reject(e);
    }
  });

  CdvPurchase.store.initialize([platform]).then(() => {
    const product = CdvPurchase.store.get(productId, platform);
    if (!product) { reject(new Error('Subscription product not found. Check Google Play Console.')); return; }
    const offer = product.getOffer?.();
    if (!offer) { reject(new Error('No offer available for this product.')); return; }
    offer.order().then((err) => { if (err) reject(new Error(err.message || 'Purchase failed')); });
  }).catch(reject);
});

// Restore existing Google Play purchases.
export const restorePurchases = () => new Promise((resolve, reject) => {
  const CdvPurchase = window.CdvPurchase;
  if (!CdvPurchase?.store || !_platform()) { resolve(false); return; }
  CdvPurchase.store.restorePurchases().then(async () => {
    await refreshPremiumStatus();
    resolve(_premiumStatus);
  }).catch(reject);
});

// Send purchase token to Supabase Edge Function for server-side verification.
const _verifyWithServer = async (purchaseToken, productId) => {
  if (!_userId) throw new Error('Must be signed in to verify purchase.');
  const ua = navigator.userAgent;
  const platform = /iphone|ipad|ipod/i.test(ua) ? 'apple' : 'google';
  const resp = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ userId: _userId, purchaseToken, productId, platform }),
  });
  if (!resp.ok) throw new Error('Server verification failed. Please try again.');
  const { premium } = await resp.json();
  if (!premium) throw new Error('Purchase could not be verified. Contact support.');
};
