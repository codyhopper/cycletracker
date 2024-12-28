// service worker
// TODOS: include syncing and push: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation

// unique identifier
const VERSION = "v1";

// application cache name
const CACHE_NAME = `period-tracker-${VERSION}`;

// list of offline resources
// TODO: include any resources statically included in the app
const APP_STATIC_RESOURCES = [
    "/",
    "/index.html", 
    "/style.css",
    "/app.js",
    "/cycletracker.json",
    "/icons/wheel.svg",
]

// on install, cache static resources
self.addEventListener("install", (event) => {
    // .waitUntill() is a request to the browser to not terminate the service worker while a task is being executed and promise settles
    event.waitUntil(
        (async () => {
            // .open() returns a promise that resolves to the cache object matching the name
            const cache = await caches.open(CACHE_NAME);
            
            // .addAll() adds responses to the given cache
            cache.addAll(APP_STATIC_RESOURCES);
        })(),
    );
});

// on activate, delete old caches and avoid running out of space
self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const names = await caches.keys();
            await Promise.all(
                names.map((name) => {
                if (name !== CACHE_NAME) {
                    return caches.delete(name);
                }
            }),
        );
            await clients.claim();
        })(),
    );
});

// on fetch, intercept server requests and respond with cached responses instead of going to server
self.addEventListener("fetch", (event) => {
    // when seeking an HTML page
    if (event.request.mode === "navigate") {
        // Return to the index.html page as single-page app
        event.respondWith(caches.match("/"));
        return;
    }
  
    // For every other request type, go to cache first, then network
    event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			const cachedResponse = await cache.match(event.request.url);
			if (cachedResponse) {
				// Return the cached response if it's available.
				return cachedResponse;
			}

        	// Respond with a HTTP 404 response status.
        	return new Response(null, { 
				status: 404 
			});
		})(),
	);
});
