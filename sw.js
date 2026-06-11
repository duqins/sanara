// App-shell cache. Tide/weather data is NOT cached here — the app itself
// keeps the last fetched series in storage, so offline forecasts come from
// there. Bump VERSION to invalidate old shells after a deploy.
const VERSION = "sanara-v3";
// Relative to the SW's own URL, so the app can live at a site root or a
// subpath (e.g. GitHub Pages) unchanged.
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

// Vite hashes the bundle filenames, so a static list can't name them:
// read them out of the freshly fetched index.html at install time.
async function precache() {
  const cache = await caches.open(VERSION);
  await cache.addAll(SHELL.map(u => new Request(u, { cache: "reload" })));
  try {
    const html = await (await fetch("./index.html", { cache: "reload" })).text();
    const assets = [...html.matchAll(/(?:src|href)="(\.?\/?assets\/[^"]+)"/g)].map(m => m[1]);
    if (assets.length) await cache.addAll(assets.map(u => new Request(u, { cache: "reload" })));
  } catch {}
}

self.addEventListener("install", e => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.hostname.endsWith("open-meteo.com")) return;

  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r.ok) {
            const copy = r.clone();
            e.waitUntil(caches.open(VERSION).then(c => c.put("./index.html", copy)));
          }
          return r;
        })
        .catch(() =>
          caches.match("./index.html").then(hit =>
            hit || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
          )
        )
    );
    return;
  }

  const cacheable = url.origin === location.origin
    || url.hostname === "fonts.googleapis.com"
    || url.hostname === "fonts.gstatic.com";
  if (!cacheable) return;

  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request)
        .then(r => {
          if (r.ok || r.type === "opaque") {
            const copy = r.clone();
            e.waitUntil(caches.open(VERSION).then(c => c.put(e.request, copy)));
          }
          return r;
        })
        .catch(() => hit || new Response("", { status: 504, statusText: "offline" }));
      return hit || net;
    })
  );
});
