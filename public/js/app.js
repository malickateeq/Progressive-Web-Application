// Check the compatibility of Service Workers2
if("serviceWorker" in navigator)
{
    // Register a Service Worker - asynchronous task
    navigator.serviceWorker.register("/sw.js")
        .then( (reg) => console.log("SW Registered.", reg) )
        .catch((err) => console.log("SW not registered.", err))
}