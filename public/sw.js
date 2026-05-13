/* eslint-disable @typescript-eslint/no-explicit-any */

const CACHE_NAME = "cafe-services-cache-v1";

// Core static assets to cache on installation
const STATIC_ASSETS = [
	"/",
	"/customer-manifest.json",
	"/admin-manifest.json",
	"/icon.svg",
	"/globals.css"
];

// Install Event: cache static resources
self.addEventListener("install", (event: any) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		}).then(() => {
			return self.skipWaiting();
		})
	);
});

// Activate Event: prune old caches
self.addEventListener("activate", (event: any) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cache) => {
					if (cache !== CACHE_NAME) {
						return caches.delete(cache);
					}
				})
			);
		}).then(() => {
			return self.clients.claim();
		})
	);
});

// Fetch Event: network-first strategy for dynamic pages, cache-fallback for assets
self.addEventListener("fetch", (event: any) => {
	const url = new URL(event.request.url);

	// Bypass real-time notification streams entirely to prevent stalling stream connections
	if (url.pathname.startsWith("/api/notifications/stream")) {
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
			})
	);
});
