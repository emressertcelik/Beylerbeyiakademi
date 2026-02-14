const CACHE_NAME = "bb-akademi-v2";

// Sadece gerçek statik dosyalar cache'lenir - sayfalar ve API asla cache'lenmez
const STATIC_ASSETS = [
  "/manifest.json",
  "/Logo_S.png",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
];

// Cache'lenmemesi gereken yollar
const NO_CACHE_PATTERNS = [
  "/api/",
  "/dashboard",
  "/login",
  "/supabase",
  "/_next/data/", // Next.js data fetches (kullanıcıya özel olabilir)
];

function shouldCache(url) {
  const path = new URL(url).pathname;
  // HTML sayfaları cache'lenmesin
  if (path === "/" || !path.includes(".")) return false;
  // Belirli yollar cache'lenmesin
  for (const pattern of NO_CACHE_PATTERNS) {
    if (path.startsWith(pattern)) return false;
  }
  return true;
}

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for everything, cache only static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Navigation requests (HTML pages): always network, never cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/"))
    );
    return;
  }

  const url = request.url;

  // API and dynamic content: always network, no cache
  if (!shouldCache(url)) {
    return; // Let browser handle normally
  }

  // Static assets only: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.status === 200 && shouldCache(url)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Push notifications (for future use)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Beylerbeyi Akademi";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    data: data.url ? { url: data.url } : {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
