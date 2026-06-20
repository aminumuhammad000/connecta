const CACHE_NAME = 'connecta-assets-v1';
const IMAGE_TYPES = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'];

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Fetch Event - Cache First Strategy for Images
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const extension = url.pathname.split('.').pop().toLowerCase();

    if (IMAGE_TYPES.includes(extension)) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    // Return from cache if found
                    if (response) return response;

                    // Otherwise fetch from network, then cache it
                    return fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    }
});
