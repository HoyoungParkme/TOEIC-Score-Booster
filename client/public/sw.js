const CACHE_NAME = "toeic-offline-v4";
const scopeUrl = new URL(self.registration.scope);
const basePath = scopeUrl.pathname.replace(/\/$/, "");
const appShellUrl = `${basePath}/`;
const PRECACHE_URLS = [
  appShellUrl,
  `${basePath}/index.html`,
  `${basePath}/manifest.webmanifest`,
  `${basePath}/favicon.png`,
  `${basePath}/apple-touch-icon.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(appShellUrl, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(appShellUrl)
            .then((cached) => cached ?? caches.match(`${basePath}/index.html`)),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkRequest = fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => cached);

      if (cached) {
        networkRequest.catch(() => null);
        return cached;
      }

      return networkRequest;
    }),
  );
});
