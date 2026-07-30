/* LDRP Morning Brief - service worker. Caches the app so it opens instantly and
   works offline (handy on a spotty commute). Bump CACHE to force an update. */
const CACHE = "ldrp-brief-v2";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
// NETWORK-FIRST (so the morning tap always pulls the freshest brief when you have
// signal), falling back to the cached copy only when you're offline. This is what
// makes "tap the icon and it's updated" actually work once the host is refreshed.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
