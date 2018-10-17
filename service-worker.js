importScripts("./src/sw-utils.js");

const VERSION = 17;
const CACHE_NAME = "app-cache";

const cacheFiles = [{
  "": [
    // "",                                                             // Enable offline i.e. cache '/' - implement network first
    `bundle.js?v=${VERSION}`,                                       // Cache busting when 'bundle' updated
    "logo.svg"
  ]
}];

const urlInFilesToCache = pathExistsIn(cacheFiles, self.location.origin);

console.log(`Installing service worker v${VERSION}`);

self.addEventListener("install", self.skipWaiting);                 // Activate as soon as install finished

self.addEventListener("activate", event =>
  event.waitUntil(self.clients.claim())                             // Take control of the page immediately
);

self.addEventListener("pushsubscriptionchange", event =>
  event.waitUntil(handlePushSubscriptionChange(event.oldSubscription, event.newSubscription))
);

self.addEventListener("fetch", event =>
  event.respondWith(cacheFirst(CACHE_NAME, self.caches, event.request))
);

self.addEventListener("push", event =>
  event.waitUntil(handlePushEvent(event.data.text()))
);

self.addEventListener("notificationclick", event =>
  event.waitUntil(handleNotificationClick())
);

const handlePushSubscriptionChange = async (oldSubscription, newSubscription) => {
  debugger;
  console.log(oldSubscription, newSubscription);

  // Remove subscription from database using oldSubscription
  // const subscription = await self.registration.pushManager.subscribe({userVisibleOnly: true});
};

const cacheFirst = async (cacheName, caches, request) => {
  if (!urlInFilesToCache(request.url)) {
    return await fetch(request);
  }

  const cache = await caches.open(cacheName);
  let response = await cache.match(request);

  if (!response) {
    try {
      response = await fetch(request);
      await removeExistingVersions(request, cache);
      cache.put(request, response.clone());
    } catch (err) {
      console.log(`Network call failed (v${VERSION})`, err);
      response = await cache.match("offline.html");
    }
  }

  return response;
};

const removeExistingVersions = async (request, cache) => {
  const existingVersions = await cache.matchAll(request, {ignoreSearch: true});
  existingVersions.forEach(async ({url}) => await cache.delete(new Request(url)));
};

const handlePushEvent = body =>
  self.registration.showNotification("Credit Savvy Notification", {
    title: "Notification Title",
    body,
    // icon: "./images/favicons/favicon-32.png"
  });

const handleNotificationClick = async () => {
  const clients = await self.clients.matchAll();                    // Retrieve a list of the clients of this service worker.
  // const focused = clients.some(({focused}) => focused);             // Check if there is at least one focused client.
  
  if (clients.length > 0) {                                         // Focus the first client, if it exists.
      return clients[0].focus();
  }
  return self.clients.openWindow("/");                              // Else open a new page.
};
