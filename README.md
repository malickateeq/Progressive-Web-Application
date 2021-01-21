# PWA

1. Create Web App Manifest file: "manifest.json"
    - This will tell info about the application.
    - For all manifest options visit "https://web.dev/add-manifest"
    
    {
        "name": "My PWA!",
        "short_name": "PWA",
        "start_url": ".",
        "display": "standalone"
    }

    // name -- PWA name
    // short_name -- Show underneath the mobile app icon
    // start_url -- If the user taps on the icon, this url is launched
    // display -- Customize what browser UI is shown when your app is launched.

    - To run in Android emulator: 10.0.2.2:port
    - Use "LightHouse Audit" in Chrome dev-tools to check performance and Google checklist for PWAs. 

## Service Workers:
    Service workers can do; (They're .js files)
    - User background sync
    - Load content offline
    - Use push notifications

    * Separate Thread: No access to the DOM, instead have a different job to do.
    - Are background processes.
    - Their job is to: listen for fetch requests, push messages, events, etc

    - Never cache Service Workers, if you do newer workers can't be updated. "app.js"
    

### Service Worker Lifecycle
    - sw.js access to different scopes where it's created. Place in root -> control all.

    1. Register Service Worker with the Browser in app.js or main.js file.
    2. Then the browser will install this event. => This is "Lifecycle Event"
    3. We can even listen to this Lifecycle event in ws.js when installed.
    4. Then "Service Worker" becomes "Active"
    5. Once a "Service Worker" is active it can access all the different pages and files.
    6. "Service Worker" when active can listen to events. (Https fetch Requests)

    ** If "Service Worker" file contents got changed -> It will remain "waiting" status UNLESS all other instances of previous
        service workers got terminated.
    - We can replace the old SW when installing new one, coz it'll cause crash. 

### 1. Register a Service Worker

```js
// Check the compatibility of Service Workers
if("serviceWorker" in navigator)
{
    // Register a Service Worker - asynchronous task
    navigator.serviceWorker.register("/sw.js")
        .then( (reg) => console.log("SW Registered.", reg) )
        .catch((err) => console.log("SW not registered.", err))
}
```
### 2. Service Worker Events

```js

// 1. Only fires when Service Worker file changes
// 2. Best point to cache assets
// Event: Install Service Worker
self.addEventListener("install", evt => {
    console.log("Service Worker has been installed", evt);
});

// Event: Active Service Worker
// 1. New Service Workers activate here
// 2. Best point to delete the old cache
self.addEventListener("activate", evt => {
    console.log("Service Worker has been activated", evt);
});

// Event: Fetch events: Occurs when we want to fetch something from the server.
self.addEventListener("fetch", evt => {
    console.log("Fetch event has been fired", evt);
});

```

## PWA Power

### Caching Files for offline use

```js
    // Site's Cache Name 
    const staticCacheName = "site-static";

    // Event: Install Service Worker
    self.addEventListener("install", evt => {
        // console.log("Service Worker has been installed", evt);

        // ** Wait or prevent the browser to stop this event unless all assets are cached
        // wait until the promise has resolved
        evt.waitUntil(
            caches.open(staticCacheName)
            .then(cache => {    // "cache" this is the site's cache
                // 1. Reach to the server and get ONE SINGLE resource
                cache.add()
                // 2. Reach to the server and get ALL resources
                cache.addAll(assets);
            })
        );

    });
```

### Using Cached Files for offline/optimal use

- Intercept the fetch request to the server and send cached file if available.
```js

// Event: Fetch events: Occurs when we want to fetch something from the server.
self.addEventListener("fetch", evt => 
{
    // console.log("Fetch event has been fired", evt);
    evt.respondWith(
        // Match "request" if it's available in "caches".
        caches.match(evt.request)
        .then(cacheRes => { // "cacheRes" == "mystyles.css" cached file
            // "cacheRes" will be "empty" if it's not been cached.
            // If request present in cache return else fetch from the server
            return cacheRes || fetch(evt.request);
        })
    );

});

```

### Cache versioning: Updating the old cache/content in files

1. Delete old cache files

```js

    // Event: Active Service Worker
    self.addEventListener("activate", evt => {
        // console.log("Service Worker has been activated", evt);
        evt.waitUntil(
            caches.keys()
            .then( keys => {
                console.log(keys);  // These Keys are cache stores name like: "site-static-v1"
                // Compare the current version with these keys if not match delete. means delete old ones

                // Delete all old caches
                return Promise.all(keys
                    .filter(key => key !== staticCacheName && key !== dynamicCache)
                    .map(key => caches.delete(key))
                );

            })
        );
    });

```

### Fetch Cached if not then fetch Network

```js

// Event: Fetch events: Occurs when we want to fetch something from the server.
self.addEventListener("fetch", evt => 
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

});


```

### Limiting Cache Size

```js

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

// Call this function when adding new files
limitCacheSize(dynamicCache, 10); 

```

## Firebase Integration

```js

// Offline Data - Must declare above
db.enablePersistence()
.catch(err => {
    if(err.code == 'failed-precondition')
    {
        // Probably multiple tabs open at once
        console.log("persistence falied.");
    }
    else if(err.code == 'unimplemented')
    {
        // Browser does not support persistence DB
        console.log("Your browser does not support persistence DB.");
    }
});

// Real-time listener
// Will listen to any change in the DB and send the snapshot here
db.collection("menu").onSnapshot((snapshot) => {
    // console.log(snapshot.docChanges());
    console.log("Firebase changes...");
    snapshot.docChanges().forEach(change => 
        {
        // console.log(change, change.doc.data(), change.doc.id);

        if(change.type === "added")
        {
            // Add the document data to the webpage
            renderMenu(change.doc.data(), change.doc.id);
        }
        else if(change.type === "removed")
        {
            // Remove the document data from the webpage
        }
        else if(change.type === "modified")
        {
            // Update the document data to the webpage
        }
    });
});


// Add New Manu Item
const form = document.getElementById("add-menu");
form.addEventListener("submit", evt => {
    evt.preventDefault();
    
    const menu = {
        title: form.title.value,
        ingredients: form.ingredients.value,
        price: form.price.value,
    }

    console.log(menu);
    
    db.collection('menu').add(menu)
    .catch(err => {
        console.log(err);
    });

    form.title.value = "";
    form.ingredients.value = "";
    form.price.value = "";
});

```