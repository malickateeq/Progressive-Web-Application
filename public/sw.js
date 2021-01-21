
// Site's static cache files
const staticCacheName = "site-static-v1";
const dynamicCache = "site-dynamic-v1.2";

// Limit Cache Items - Function
const limitCacheSize = (name, size) => {
    
    caches.open(name).then(cache => {
        
        cache.keys().then(keys => {
            if(keys.length > size)
            {
                // Delete the oldest item
                cache.delete(keys[0]).then(
                    // Recall this func again to recheck
                    limitCacheSize(name, size)
                );
            }
        });
    });
};

// Site Assets List
// These assets are basically request URLs => Assets related to this request
const assets = [
    "/",
    "index.html",

    "js/app.js",
    "js/ui.js",

    "css/bootstrap.min.css",
    "js/bootstrap.bundle.min.js",
    "pages/fallback.html"
];

// Event: Install Service Worker
self.addEventListener("install", evt => 
{
    // console.log("Service Worker has been installed", evt);
    
    // ** Wait or prevent the browser to stop this event unless all assets are cached
    // wait until the promise has resolved
    evt.waitUntil(
        caches.open(staticCacheName)
        .then(cache => {    // "cache" this is the site's cache
    
            // 1. Reach to the server and get ONE SINGLE resource
            // cache.add()
    
            // 2. Reach to the server and get ALL resources
            // console.log("caching assets...");
            cache.addAll(assets);
        })
    );

});

// Event: Active Service Worker
self.addEventListener("activate", evt => {
    // console.log("Service Worker has been activated", evt);
    
    evt.waitUntil(
        caches.keys()
        .then( keys => {
            // console.log(keys);  // These Keys are cache stores name like: "site-static-v1"
            // Compare the current version with these keys if not match delete. means delete old ones

            // Delete all old caches
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCache)
                .map(key => caches.delete(key))
            );

        })
    );
});

// Event: Fetch events: Occurs when we want to fetch something from the server.
self.addEventListener("fetch", evt => 
{
    if(evt.request.url.indexOf("firestore.googleapis.com") === -1)  // Not caching Firebase requests
    {
        // console.log("Fetch event has been fired", evt);
        evt.respondWith(
            // Match "request" if it's available in "caches".
            caches.match(evt.request)
            .then(cacheRes => { // "cacheRes" == "mystyles.css" cached file
                // "cacheRes" will be "empty" if it's not been cached.
                // If request present in cache return else fetch from the server
                return cacheRes || fetch(evt.request).then(fetchRes => {
                    // If its new add it to cache
                    return caches.open(dynamicCache).then(cache => {
                        cache.put(evt.request.url, fetchRes.clone());
                        limitCacheSize(dynamicCache, 50);
                        return fetchRes;
                    });
                });
            })
            // Fallback page: when resource not found from cache | server (offline)
            .catch(() => {
                // Return if resource is an html page not any css, js or img resources
                if(evt.request.url.indexOf(".html") > -1)    // Find .html in url, if found return position else -1 
                {
                    return caches.match('/pages/fallback.html');
                }
            })
        );
    }

});
