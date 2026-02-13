const CACHE_KEY = "titan";

const STATIC_ASSETS = [
  // "/",
  // "/index.html",
  // "/pages/exercises.html",
  // "/pages/profile.html",
  // "/pages/offline.html",
  // "/pages/404.html",
  // "/js/app.js",
  // "/js/worker.js",
  // "/css/style.css",
  // "/css/exercises.css",
  // "/css/profile.css",
  // "/css/offline.css",
  // "/css/404.css",
  // "/images/icons/icon-72x72.png",
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_KEY);
        return cache.addAll(STATIC_ASSETS);
      } catch (error) {
        console.log("add to cache failed", error);
      }
    })(),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();

        return Promise.all(
          keys
            .filter((key) => key !== CACHE_KEY)
            .map((key) => caches.delete(key)),
        );
      } catch (error) {
        console.log("error deleting cache: ", error);
      }
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      try {
        const cachedRes = await caches.match(e.request);
        if (cachedRes) return cachedRes;

        let networkRes = await fetch(e.request);

        if (networkRes.status === 404) {
          if (e.request.mode === "navigate") {
            return caches.match("/pages/404.html");
          }
          return networkRes;
        }

        // let cache = await caches.open(CACHE_KEY);
        // cache.put(e.request, networkRes.clone());

        return networkRes;
      } catch (err) {
        if (e.request.mode === "navigate") {
          return caches.match("/pages/offline.html");
        }
        return new Response("Network error", {
          status: 408,
          headers: { "Content-Type": "text/plain" },
        });
      }
    })(),
  );
});
