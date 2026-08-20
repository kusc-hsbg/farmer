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
const LOCAL_MANIFEST_URL = MIRROR + 'local-images.json';
const LOCAL_IMAGES = new URL('./framerusercontent.com/images/', self.location).href;

let ready = null;
let byUrl = null;   // exact request url -> {file, type, bytes}
let byBase = null;  // image path (before "?") -> [{file, type, bytes}] sorted by bytes desc
let localImg = null; // image id (framer base, no size hash) -> [{file, bytes}] sorted by bytes desc

const EXT_TYPE = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif', svg: 'image/svg+xml' };

function load() {
  if (!ready) {
    ready = Promise.all([
      fetch(MANIFEST_URL).then((r) => r.json()).catch(() => ({})),
      fetch(LOCAL_MANIFEST_URL).then((r) => r.json()).catch(() => ({})),
    ]).then((res) => {
      const m = res[0] || {};
      byUrl = m;
      byBase = Object.create(null);
      for (const [u, info] of Object.entries(m)) {
        const base = u.split('?')[0];
        (byBase[base] || (byBase[base] = [])).push(info);
      }
      for (const k in byBase) byBase[k].sort((a, b) => (b.bytes || 0) - (a.bytes || 0));
      localImg = res[1] || {};
    }).catch(() => { byUrl = {}; byBase = Object.create(null); localImg = {}; });
  }
  return ready;
}

// A Framer image request looks like .../images/<ID><4-char size hash>.<ext> OR the
// original .../images/<ID>.<ext>?<transform>. Recover the ID that keys local-images.json.
function localImageId(pathname) {
  const m = pathname.match(/\/images\/([^\/?]+?)\.(png|jpe?g|webp|avif|gif|svg)$/i);
  if (!m) return null;
  const stem = m[1];
  if (localImg && localImg[stem]) return stem;              // original id (runtime CDN url)
  if (stem.length > 4 && localImg && localImg[stem.slice(0, -4)]) return stem.slice(0, -4); // suffixed local name
  return null;
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

  // Final fallback for images: serve the site's own local static export copy. This
  // covers any image size/variant the CDN mirror did not capture, because the local
  // export contains every image the site actually uses.
  try {
    const u = new URL(full);
    const id = localImageId(u.pathname);
    if (id) {
      const best = localImg[id][0];
      const ext = (best.file.split('.').pop() || '').toLowerCase();
      const resp = await fetch(LOCAL_IMAGES + encodeURIComponent(best.file));
      if (resp.ok) {
        const body = await resp.blob();
        return new Response(body, {
          status: 200,
          headers: { 'Content-Type': EXT_TYPE[ext] || 'application/octet-stream', 'Cache-Control': 'max-age=31536000' },
        });
      }
    }
  } catch (_) {}

  // Not mirrored and no local copy. Try the network (Framer may still be alive); else fail soft.
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
