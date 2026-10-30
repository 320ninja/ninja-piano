// RevenueCat subscription management.
// Public SDK keys are safe to ship in the app — they only allow
// purchases/lookups for the authenticated user, never server-side writes.

import { RC_API_KEY_ANDROID, RC_ENTITLEMENT_ID } from './config.js';

let _Purchases = null;
let _premiumStatus = false; // default DENY — never grant on error or unknown state

// Call once after the user signs in (or on cold start if already signed in).
export const initRevenueCat = async (userId) => {
  try {
    const mod = await import('@revenuecat/purchases-capacitor');
    _Purchases = mod.Purchases;
    await _Purchases.configure({ apiKey: RC_API_KEY_ANDROID });
    if (userId) await _Purchases.logIn({ appUserID: userId });
    await _refreshStatus();
  } catch (_) {
    // Not running in Capacitor (web) or plugin unavailable — deny premium
    _premiumStatus = false;
  }
};

// Internal: fetches entitlement from RevenueCat servers (no cache trusted)
const _refreshStatus = async () => {
  if (!_Purchases) { _premiumStatus = false; return; }
  try {
    const { customerInfo } = await _Purchases.getCustomerInfo();
    _premiumStatus = !!customerInfo.entitlements.active[RC_ENTITLEMENT_ID];
  } catch (_) {
    // Network error or RevenueCat down → deny. NEVER grant on failure.
    _premiumStatus = false;
  }
};

export const refreshPremiumStatus = _refreshStatus;

// Synchronous check for use in UI rendering — updated by initRevenueCat
export const isPremium = () => _premiumStatus;

// Trigger Google Play purchase flow
export const purchasePremium = async () => {
  if (!_Purchases) throw new Error('Billing not available on this platform');
  const { current: offering } = await _Purchases.getOfferings();
  if (!offering?.monthly) throw new Error('No monthly package configured in RevenueCat');
  const { customerInfo } = await _Purchases.purchasePackage({ aPackage: offering.monthly });
  _premiumStatus = !!customerInfo.entitlements.active[RC_ENTITLEMENT_ID];
  return _premiumStatus;
};

// Restore purchases (required by app store policy)
export const restorePurchases = async () => {
  if (!_Purchases) throw new Error('Billing not available on this platform');
  const { customerInfo } = await _Purchases.restorePurchases();
  _premiumStatus = !!customerInfo.entitlements.active[RC_ENTITLEMENT_ID];
  return _premiumStatus;
};
