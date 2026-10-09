/**
 * WeSakhi Service Worker — Fully Automatic Cache Version Management
 * ─────────────────────────────────────────────────────────────────
 * NO MANUAL CHANGES EVER NEEDED HERE.
 *
 * How it works:
 *   1. GitHub Actions updates /version.json with a timestamp+SHA on every push.
 *   2. This SW reads /version.json (always bypassing cache) to get the version.
 *   3. On install  → creates a new versioned cache, pre-fetches core assets.
 *   4. On activate → deletes all older wesakhi-* caches automatically.
 *   5. While running → checks version.json every 5 min; if a new deploy is
 *      detected, it notifies the page which then auto-reloads.
 */

// ── Constants ─────────────────────────────────────────────────────────────────
const CACHE_PREFIX    = 'wesakhi-';
const META_CACHE      = 'wesakhi-meta';     // Stores SW metadata (current version)
const VERSION_URL     = '/version.json';
const VERSION_META_KEY = '/__active-version__';

/** Core assets to pre-fetch and cache on install */
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/design-tokens.css',
  '/css/base.css',
  '/css/components.css',
  '/css/views.css',
  '/js/data.js',
  '/js/router.js',
  '/js/modals.js',
  '/js/main.js',
  '/assets/images/accounts-sakhi-logo.jpg',
  '/assets/images/sakhi-creations-logo.jpg',
];

// ── Version Helpers ───────────────────────────────────────────────────────────

/**
 * Fetch the live version from /version.json, always bypassing all caches.
 * Returns the version string, or null on failure.
 */
async function fetchLiveVersion() {
  try {
    const resp = await fetch(`${VERSION_URL}?_=${Date.now()}`, {
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
 * Read the version that this SW instance cached during install.
 * Stored in the META_CACHE so it survives SW restarts.
 */
async function getInstalledVersion() {
  try {
    const meta = await caches.open(META_CACHE);
    const resp  = await meta.match(VERSION_META_KEY);
    if (resp) {
      const data = await resp.json();
      return data.v || null;
    }
  } catch {}
  return null;
}

/** Persist the active version to META_CACHE. */
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

/** Returns the cache name for a given version string. */
function toCacheName(version) {
  return `${CACHE_PREFIX}${version}`;
}

/** Send a message to all controlled browser windows/tabs. */
async function broadcastToClients(payload) {
  try {
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    clients.forEach(client => client.postMessage(payload));
  } catch {}
}

// ── Install ───────────────────────────────────────────────────────────────────

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // Always fetch a fresh version on install
    let version = await fetchLiveVersion();

    // Fallback: use the current minute as version (still unique per deploy)
    if (!version) {
      version = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
      console.warn('[SW] version.json unavailable — using timestamp fallback:', version);
    }

    const cacheName = toCacheName(version);
    console.log('[SW] Installing version:', version, '→ cache:', cacheName);

    // Pre-cache all core assets (failures are logged but don't abort install)
    const cache = await caches.open(cacheName);
    const results = await Promise.allSettled(
      PRECACHE_ASSETS.map(url =>
        cache.add(url).catch(err => {
          console.warn('[SW] Pre-cache failed for:', url, '—', err.message);
        })
      )
    );

    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed > 0) console.warn(`[SW] ${failed} asset(s) could not be pre-cached.`);

    // Store the version so activate + fetch can use it
    await setInstalledVersion(version);

    // Skip waiting: take over immediately without waiting for tabs to close
    await self.skipWaiting();
  })());
});

// ── Activate ──────────────────────────────────────────────────────────────────

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const currentVersion  = await getInstalledVersion();
    const currentCache    = currentVersion ? toCacheName(currentVersion) : null;

    // Delete every wesakhi-* cache that isn't the current version or the meta cache
    const allCacheKeys = await caches.keys();
    const toDelete = allCacheKeys.filter(
      key => key.startsWith(CACHE_PREFIX) && key !== currentCache
    );

    if (toDelete.length > 0) {
      console.log('[SW] Clearing stale caches:', toDelete);
      await Promise.all(toDelete.map(key => caches.delete(key)));
    }

    // Take control of all open tabs immediately
    await self.clients.claim();
    console.log('[SW] Active. Version:', currentVersion);
  })());
});

// ── Periodic Update Check ─────────────────────────────────────────────────────

let lastCheckAt = 0;
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Compares the live version.json against the installed version.
 * If they differ, broadcasts UPDATE_AVAILABLE so the page can auto-reload.
 * Rate-limited to at most once every CHECK_INTERVAL_MS.
 */
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

  // Only intercept same-origin GET requests
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  // Always let version.json go straight to network (never cache it)
  if (url.pathname === '/version.json') {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  // HTML page navigations — Network First + background update check
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Everything else (CSS, JS, images) — Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// ── Fetch Strategies ──────────────────────────────────────────────────────────

/** Get the currently-active cache, falling back gracefully. */
async function getActiveCache() {
  const version = await getInstalledVersion();
  const name    = version ? toCacheName(version) : `${CACHE_PREFIX}fallback`;
  return caches.open(name);
}

/**
 * Network First — Always tries the network for fresh HTML.
 * Falls back to cache when offline.
 * Triggers a background update check once per 5-minute window.
 */
async function handleNavigation(request) {
  const cache = await getActiveCache();

  // Fire background version check (non-blocking)
  checkForUpdates().catch(() => {});

  try {
    const networkResp = await fetch(request);
    if (networkResp.ok) {
      cache.put(request, networkResp.clone());
    }
    return networkResp;
  } catch {
    // Offline — serve cached page or a friendly offline message
    const cached = await cache.match(request)
      || await cache.match('/index.html')
      || await cache.match('/');

    return cached || new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WeSakhi — You're Offline</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; text-align: center;
           padding: 80px 24px; color: #333; background: #FAF8F5; }
    h1   { font-size: 2rem; margin-bottom: 12px; }
    p    { color: #666; max-width: 40ch; margin: 0 auto 24px; line-height: 1.6; }
    a    { display: inline-block; padding: 10px 24px; background: #7A2833;
           color: #fff; border-radius: 6px; text-decoration: none; }
  </style>
</head>
<body>
  <h1>You're Offline</h1>
  <p>WeSakhi couldn't be reached. Please check your internet connection and try again.</p>
  <a href="/">Try Again</a>
</body>
</html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

/**
 * Stale While Revalidate — serve from cache instantly, refresh in background.
 * Best for CSS, JS, images: user sees fast load, cache stays fresh.
 */
async function staleWhileRevalidate(request) {
  const cache  = await getActiveCache();
  const cached = await cache.match(request);

  // Always revalidate in the background, regardless of cache hit
  const revalidate = fetch(request)
    .then(resp => {
      if (resp.ok) cache.put(request, resp.clone());
      return resp;
    })
    .catch(() => null);

  // Return cached immediately, or wait for network if no cache
  return cached ?? (await revalidate) ?? new Response('', { status: 503 });
}
