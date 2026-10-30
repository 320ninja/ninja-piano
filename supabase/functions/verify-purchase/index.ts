// Supabase Edge Function: verify a subscription purchase on Google Play or Apple App Store
// and update the premium_users table.
//
// Required env vars (set in Supabase dashboard → Edge Functions → Secrets):
//   GOOGLE_SERVICE_ACCOUNT_KEY  — JSON string of the service account key file (Android)
//   APPLE_SHARED_SECRET         — App-specific shared secret from App Store Connect (iOS)
//   SUPABASE_URL                — auto-set by Supabase
//   SUPABASE_SERVICE_ROLE_KEY   — auto-set by Supabase

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PACKAGE_NAME   = 'com.techagent247.ninjapiano';
const APPLE_BUNDLE   = 'com.techagent247.ninjapiano'; // same ID for iOS

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let body: { userId?: string; purchaseToken?: string; productId?: string; platform?: string };
  try { body = await req.json(); } catch { return json({ premium: false, error: 'Invalid JSON' }, 400); }

  const { userId, purchaseToken, productId, platform } = body;
  if (!userId || !purchaseToken || !productId) {
    return json({ premium: false, error: 'Missing required fields' }, 400);
  }

  try {
    const isApple = platform === 'apple' ||
      (platform == null && !purchaseToken.startsWith('{"') && purchaseToken.length > 200);

    const { isActive, expiresAt } = isApple
      ? await verifyApple(purchaseToken, productId)
      : await verifyGoogle(purchaseToken, productId);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    const { error: upsertError } = await supabase.from('premium_users').upsert({
      user_id: userId,
      purchase_token: purchaseToken,
      product_id: productId,
      is_active: isActive,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (upsertError) console.error('Supabase upsert error:', upsertError.message);
    return json({ premium: isActive });
  } catch (e) {
    console.error('verify-purchase error:', e);
    return json({ premium: false, error: 'Internal error' });
  }
});

// ─── Google Play ─────────────────────────────────────────────────────────────

async function verifyGoogle(purchaseToken: string, _productId: string) {
  const accessToken = await getGoogleAccessToken();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${purchaseToken}`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!resp.ok) {
    console.error('Google Play API error:', resp.status, await resp.text());
    throw new Error('Google Play verification failed');
  }
  const purchase = await resp.json();
  const state = purchase.subscriptionState as string;
  const isActive = state === 'SUBSCRIPTION_STATE_ACTIVE' ||
                   state === 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD';
  const expiresAt = purchase.lineItems?.[0]?.expiryTime ?? null;
  return { isActive, expiresAt };
}

async function getGoogleAccessToken(): Promise<string> {
  const keyJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
  if (!keyJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set');
  const sa = JSON.parse(keyJson);
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim  = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  }));
  const sigInput = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    'pkcs8', pemToBuf(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(sigInput));
  const jwt = `${sigInput}.${bufToB64url(sig)}`;
  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const { access_token, error } = await tokenResp.json();
  if (!access_token) throw new Error(`Google token exchange failed: ${error}`);
  return access_token;
}

// ─── Apple App Store ─────────────────────────────────────────────────────────
// purchaseToken on iOS is the base64-encoded App Store receipt (appStoreReceipt)

async function verifyApple(receipt: string, productId: string) {
  const sharedSecret = Deno.env.get('APPLE_SHARED_SECRET');
  if (!sharedSecret) throw new Error('APPLE_SHARED_SECRET not set');

  const body = JSON.stringify({ 'receipt-data': receipt, password: sharedSecret, 'exclude-old-transactions': true });

  // Try production first; if status 21007, fall back to sandbox (for TestFlight)
  let resp = await fetch('https://buy.itunes.apple.com/verifyReceipt', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
  });
  let data = await resp.json();
  if (data.status === 21007) {
    resp = await fetch('https://sandbox.itunes.apple.com/verifyReceipt', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
    });
    data = await resp.json();
  }

  if (data.status !== 0) {
    console.error('Apple receipt status:', data.status);
    return { isActive: false, expiresAt: null };
  }

  // Find the latest receipt for our product
  const latestReceipts: Array<Record<string, string>> = data.latest_receipt_info ?? [];
  const ours = latestReceipts
    .filter((r) => r.product_id === productId)
    .sort((a, b) => Number(b.expires_date_ms) - Number(a.expires_date_ms));

  if (!ours.length) return { isActive: false, expiresAt: null };

  const latest = ours[0];
  const expiresMs = Number(latest.expires_date_ms);
  const isActive  = expiresMs > Date.now() && latest.cancellation_date == null;
  const expiresAt = new Date(expiresMs).toISOString();

  return { isActive, expiresAt };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const b64url      = (s: string) => btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
const bufToB64url = (b: ArrayBuffer) => b64url(String.fromCharCode(...new Uint8Array(b)));
const pemToBuf    = (pem: string) => {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
