const CACHE_NAME = "dealup-v2";

const APP_SHELL = [
  "/",
  "/offline.html",
];

// =======================================================
// Install
// =======================================================

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }),
  );

  self.skipWaiting();
});

// =======================================================
// Activate
// =======================================================

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName.startsWith("dealup-") &&
              cacheName !== CACHE_NAME
            );
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          }),
      );
    }),
  );

  self.clients.claim();
});

// =======================================================
// Fetch
// =======================================================

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  // Ignore browser extensions
  if (request.url.startsWith("chrome-extension://")) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful same-origin responses
        if (
          response.ok &&
          new URL(request.url).origin === self.location.origin
        ) {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return caches.match("/offline.html");
        });
      }),
  );
});