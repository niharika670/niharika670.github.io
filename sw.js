/**
 * WeSakhi Service Worker — Fully Automatic Cache Version Management
 * ─────────────────────────────────────────────────────────────────
 * NO MANUAL VERSION BUMPING REQUIRED.
 *
 * Automatic Cache-Busting Mechanism:
 *   1. GitHub Actions automatically stamps version.json on every push to main.
 *   2. HTML, JS, and CSS use Network-First strategy with conditional HTTP revalidation:
 *      - Online users ALWAYS receive the latest code immediately.
 *      - Offline users are served cached assets seamlessly.
 *   3. Media & images use Stale-While-Revalidate for maximum speed.
 *   4. While a user has the page open, a background checker monitors version.json.
 *      When an update is detected, it broadcasts UPDATE_AVAILABLE to trigger a gentle reload.
 */

const CACHE_PREFIX = 'wesakhi-';
const META_CACHE = 'wesakhi-meta';
const VERSION_META_KEY = '/__active_version__';

// Core assets to pre-cache on install using paths relative to SW scope
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/design-tokens.css',
  './css/base.css',
  './css/components.css',
  './css/views.css',
  './js/data.js',
  './js/router.js',
  './js/modals.js',
  './js/main.js',
  './assets/images/accounts-sakhi-logo.jpg',
  './assets/images/sakhi-creations-logo.jpg',
];

function getVersionUrl() {
  return new URL('version.json', self.registration.scope).href;
}

/**
 * Fetch the live version from version.json, always bypassing cache.
 */
async function fetchLiveVersion() {
  try {
    const url = `${getVersionUrl()}?_=${Date.now()}`;
    const resp = await fetch(url, {
      cache: 'no-store',
      credentials: 'same-origin',
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.v) return String(data.v).trim();
    }
  } catch (err) {
    console.warn('[SW] Could not fetch version.json:', err.message);
  }
  return null;
}

/**
 * Read the installed version from metadata cache.
 */
async function getInstalledVersion() {
  try {
    const meta = await caches.open(META_CACHE);
    const resp = await meta.match(VERSION_META_KEY);
    if (resp) {
      const data = await resp.json();
      return data.v || null;
    }
  } catch {}
  return null;
}

/**
 * Persist the installed version into metadata cache.
 */
async function setInstalledVersion(v) {
  try {
    const meta = await caches.open(META_CACHE);
    await meta.put(
      VERSION_META_KEY,
      new Response(
        JSON.stringify({ v, savedAt: new Date().toISOString() }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    );
  } catch (err) {
    console.warn('[SW] Could not store version:', err.message);
  }
}

function toCacheName(version) {
  return `${CACHE_PREFIX}${version}`;
}

async function getActiveCache() {
  const version = await getInstalledVersion();
  const name = version ? toCacheName(version) : `${CACHE_PREFIX}live`;
  return caches.open(name);
}

async function broadcastToClients(payload) {
  try {
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    clients.forEach(client => client.postMessage(payload));
  } catch {}
}

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    let version = await fetchLiveVersion();

    if (!version) {
      version = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
      console.warn('[SW] Using timestamp version fallback:', version);
    }

    const cacheName = toCacheName(version);
    console.log('[SW] Installing cache:', cacheName);

    const cache = await caches.open(cacheName);
    await Promise.allSettled(
      PRECACHE_ASSETS.map(url =>
        cache.add(new Request(url, { cache: 'reload' })).catch(err => {
          console.warn('[SW] Pre-cache skip for:', url, err.message);
        })
      )
    );

    await setInstalledVersion(version);
    await self.skipWaiting();
  })());
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const currentVersion = await getInstalledVersion();
    const currentCache = currentVersion ? toCacheName(currentVersion) : null;

    const allCacheKeys = await caches.keys();
    const toDelete = allCacheKeys.filter(
      key => key.startsWith(CACHE_PREFIX) && key !== currentCache && key !== META_CACHE
    );

    if (toDelete.length > 0) {
      console.log('[SW] Cleaning obsolete caches:', toDelete);
      await Promise.all(toDelete.map(key => caches.delete(key)));
    }

    await self.clients.claim();
    console.log('[SW] Active & controlling clients. Active version:', currentVersion);
  })());
});

// ── Periodic Update Check ─────────────────────────────────────────────────────
let lastCheckAt = 0;
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

async function checkForUpdates() {
  const now = Date.now();
  if (now - lastCheckAt < CHECK_INTERVAL_MS) return;
  lastCheckAt = now;

  const [liveVersion, installedVersion] = await Promise.all([
    fetchLiveVersion(),
    getInstalledVersion(),
  ]);

  if (liveVersion && installedVersion && liveVersion !== installedVersion) {
    console.log('[SW] Update detected:', installedVersion, '→', liveVersion);
    broadcastToClients({ type: 'UPDATE_AVAILABLE', newVersion: liveVersion });
  }
}

// ── Fetch Handler ─────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  // Never cache version.json — always network fresh
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  // 1. Navigation / HTML pages -> Network First (fresh HTML)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 2. Scripts and Styles -> Network First with conditional revalidation
  // Ensures any code/CSS updates on server are immediately loaded by online users
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(handleScriptOrStyle(request));
    return;
  }

  // 3. Media, Images, Fonts -> Stale While Revalidate
  event.respondWith(handleStaticAsset(request));
});

/**
 * Navigation: Network First with offline fallback page
 */
async function handleNavigation(request) {
  const cache = await getActiveCache();
  checkForUpdates().catch(() => {});

  try {
    const networkResp = await fetch(request, { cache: 'no-cache' });
    if (networkResp.ok) {
      cache.put(request, networkResp.clone());
    }
    return networkResp;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true })
      || await cache.match('./index.html', { ignoreSearch: true })
      || await cache.match('./', { ignoreSearch: true });

    return cached || new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WeSakhi — Offline</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           text-align: center; padding: 60px 20px; color: #1C1E21; background: #FAF8F5; }
    h1   { font-size: 2rem; margin-bottom: 12px; font-weight: 600; }
    p    { color: #565A60; max-width: 440px; margin: 0 auto 24px; line-height: 1.6; }
    button { padding: 12px 28px; background: #7A2833; color: #fff;
             border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; }
  </style>
</head>
<body>
  <h1>You're Offline</h1>
  <p>WeSakhi couldn't connect to the network. Please check your internet connection.</p>
  <button onclick="window.location.reload()">Retry Connection</button>
</body>
</html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

/**
 * Scripts & Styles: Network First with cache fallback
 */
async function handleScriptOrStyle(request) {
  const cache = await getActiveCache();

  try {
    const networkResp = await fetch(request, { cache: 'no-cache' });
    if (networkResp.ok) {
      cache.put(request, networkResp.clone());
    }
    return networkResp;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    return cached || new Response('', { status: 503, statusText: 'Offline' });
  }
}

/**
 * Static Assets (Images, Fonts): Stale While Revalidate
 */
async function handleStaticAsset(request) {
  const cache = await getActiveCache();
  const cached = await cache.match(request, { ignoreSearch: true });

  const fetchPromise = fetch(request)
    .then(networkResp => {
      if (networkResp.ok) {
        cache.put(request, networkResp.clone());
      }
      return networkResp;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || new Response('', { status: 503 });
}
