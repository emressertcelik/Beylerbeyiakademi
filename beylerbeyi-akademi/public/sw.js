const CACHE_NAME = "bb-akademi-v3";

// Install: Hiçbir şey cache'leme, sadece eski cache'leri temizle
self.addEventListener("install", (event) => {
  // Eski tüm cache'leri sil
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
  self.skipWaiting();
});

// Activate: Eski cache'leri temizle ve hemen devral
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Her şey network'den gelsin, hiçbir şey cache'lenmesin
self.addEventListener("fetch", (event) => {
  // Sadece GET isteklerini yakala
  if (event.request.method !== "GET") return;

  // Her şeyi network'den al, cache kullanma
  event.respondWith(
    fetch(event.request).catch(() => {
      // Offline ise basit bir hata sayfası göster
      if (event.request.mode === "navigate") {
        return new Response(
          "<html><body><h2>Çevrimdışısınız</h2><p>Lütfen internet bağlantınızı kontrol edin.</p></body></html>",
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
      return new Response("", { status: 408 });
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
