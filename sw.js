/*
 * Local Framer mirror service worker.
 *
 * Purpose: make this static export survive Framer's servers disappearing.
 * The Framer runtime still generates requests to framer.com / framerusercontent.com
 * at runtime (optimized images and dynamically-imported icon modules). This worker
 * intercepts those requests and serves locally-mirrored copies from ./framer-mirror/
 * (captured while Framer was still online). No code connection to Framer remains at
 * runtime; everything is resolved from local files.
 */
const MIRROR = new URL('./framer-mirror/', self.location).href;
const MANIFEST_URL = MIRROR + 'manifest.json';

let ready = null;
let byUrl = null;   // exact request url -> {file, type, bytes}
let byBase = null;  // image path (before "?") -> [{file, type, bytes}] sorted by bytes desc

function load() {
  if (!ready) {
    ready = fetch(MANIFEST_URL)
      .then((r) => r.json())
      .then((m) => {
        byUrl = m;
        byBase = Object.create(null);
        for (const [u, info] of Object.entries(m)) {
          const base = u.split('?')[0];
          (byBase[base] || (byBase[base] = [])).push(info);
        }
        for (const k in byBase) byBase[k].sort((a, b) => (b.bytes || 0) - (a.bytes || 0));
      })
      .catch(() => { byUrl = {}; byBase = Object.create(null); });
  }
  return ready;
}

self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(load()); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

function isFramerHost(h) {
  return h === 'framer.com' || h === 'www.framer.com' ||
         h === 'framerusercontent.com' || h.endsWith('.framerusercontent.com');
}

async function serve(request) {
  await load();
  const full = request.url;
  let info = byUrl[full];
  if (!info) {
    const base = full.split('?')[0];
    const cands = byBase[base];
    if (cands && cands.length) info = cands[0]; // best (largest) mirrored variant
  }
  if (info) {
    const resp = await fetch(MIRROR + info.file);
    if (resp.ok) {
      const body = await resp.blob();
      return new Response(body, {
        status: 200,
        headers: { 'Content-Type': info.type || 'application/octet-stream', 'Cache-Control': 'max-age=31536000' },
      });
    }
  }
  // Not mirrored. Try the network (Framer may still be alive); otherwise fail soft.
  try { return await fetch(request); } catch (_) { return new Response('', { status: 504 }); }
}

self.addEventListener('fetch', (e) => {
  let url;
  try { url = new URL(e.request.url); } catch (_) { return; }
  const h = url.hostname;
  if (h === 'events.framer.com') {
    // Framer analytics: neutralize with an empty script, never hit the network.
    e.respondWith(new Response('', { status: 200, headers: { 'Content-Type': 'application/javascript' } }));
    return;
  }
  if (!isFramerHost(h)) return;
  e.respondWith(serve(e.request));
});
