const CACHE_NAME = "cafe-services-cache-v2";

// Core static assets to cache on installation
const STATIC_ASSETS = [
	"/",
	"/admin",
	"/customer-manifest.json?v=2",
	"/admin-manifest.json?v=2",
	"/icon.svg",
	"/icon-192x192.png",
	"/icon-512x512.png",
];

// Install Event: cache static resources
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				return Promise.allSettled(
					STATIC_ASSETS.map((url) =>
						fetch(url)
							.then((response) => {
								if (response.ok) {
									return cache.put(url, response);
								}
							})
							.catch((err) =>
								console.warn(
									"Failed to cache asset:",
									url,
									err,
								),
							),
					),
				);
			})
			.then(() => {
				return self.skipWaiting();
			}),
	);
});

// Activate Event: prune old caches
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cache) => {
						if (cache !== CACHE_NAME) {
							return caches.delete(cache);
						}
					}),
				);
			})
			.then(() => {
				return self.clients.claim();
			}),
	);
});

// Fetch Event: network-first strategy for dynamic pages, cache-fallback for assets
self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);

	// Bypass all API requests entirely
	if (url.pathname.startsWith("/api/")) {
		return;
	}

	event.respondWith(
		fetch(event.request)
			.then((response) => {
				// Cache valid HTTP responses for static pages/assets dynamically
				if (response.status === 200 && event.request.method === "GET") {
					const responseToCache = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});
				}
				return response;
			})
			.catch(() => {
				// Fallback to cache when offline
				return caches.match(event.request).then((cachedResponse) => {
					if (cachedResponse) {
						return cachedResponse;
					}
					// If offline and request is a navigation page, serve cached index
					if (event.request.mode === "navigate") {
						return caches.match("/");
					}
				});
			}),
	);
});
