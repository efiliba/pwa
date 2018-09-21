const VERSION = "v2";
const CACHE_NAME = `app-cache-${VERSION}`;

const node = (data, children = []) => ({
    data,
    children
});

const cacheContentNodes = {
    "https://cdnjs.cloudflare.com/ajax/libs": node([
        "animate.css/3.5.2/animate.min.css",
        "toastr.js/2.1.3/toastr.min.css"
    ]),
    "": node([
        "",
        "d3v",
        "offline.html"
    ], {
        Scripts: node([
            "raphael.js",
            "vendors~client.js",
            "client.js"
        ]),
        Content: node([
            "bootstrap.min.css",
            "site.css"
        ], {
            Images: node([
                "spinner.png",
                "member-home.svg",
                "logo-tyme-coach-white.svg",
                "chat-bot.svg",
                "get-help.svg",
                "gauge.svg",
                "learn.svg",
                "alerts.svg",
                "document-locked.svg",
                "help-circle.svg",
                "pictogram-lock.svg",
                "logo-tyme-digital.svg",
                "member-slider-close.svg",
                "gauge-inverse.svg",
                "learn-inverse.svg",
                "alerts-inverse.svg",
                "help-inverse.svg",
                "lock-inverse.svg",
                "logo-tyme-digital-white.svg",
                "home-background.jpg",
                "mobile-home-background.jpg"
            ]),
            fonts: node([
                "HelveticaNeueLTPro-Lt.otf",
                "HelveticaNeueLTPro-Roman.otf"
            ])
        })
    })
};

const buildPaths = (nodes, subPath = "", acc = []) =>
    acc.concat(...Object.entries(nodes).map(([addPath, {data, children}]) => {
        const path = subPath + addPath;		
        if (!children)
            return data.map(x => `${path}/${x}`);
        
        return buildPaths(children, `${path}/`, data.map(x => `${path}/${x}`));
    }));

const l = (...message) => console.log(VERSION, ...message);

l("Installing service worker");

self.addEventListener("install", event =>
    event.waitUntil(installServiceWorker())
);

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());                          // Take control of the page immediately
    clearPreviousCaches();
});

self.addEventListener("pushsubscriptionchange", event =>
    event.waitUntil(handlePushSubscriptionChange())
);

self.addEventListener("fetch", event =>
    event.respondWith(cacheFirst(event.request.clone()))
);

self.addEventListener("push", event =>
    event.waitUntil(handlePushEvent(event.data.text()))
);

self.addEventListener("notificationclick", event =>
    event.waitUntil(handleNotificationClick())
);

async function installServiceWorker() {
    self.skipWaiting();                                             // Take control of the page immediately

    const cache = await caches.open(CACHE_NAME);
    return cache.addAll(buildPaths(cacheContentNodes));
}

async function clearPreviousCaches() {
    const keys = await caches.keys();
    keys
        .filter(key => key != CACHE_NAME)
        .forEach(key => caches.delete(key));
}

async function handlePushSubscriptionChange() {
    const subscription = await self.registration.pushManager.subscribe({userVisibleOnly: true});

    debugger;
    console.log("Todo: Need to resubscribe user");
    console.log("Subscribed after expiration", subscription.endpoint);
}

async function cacheFirst(request) {
    if (!urlInFilesToCache(request.url)) {
        return await fetch(request);
    }

    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(request);

    if (!response) {
        try {
            response = await fetch(request);
            cache.put(request, response);
        } catch (err) {
            l("Network call failed", err);
            response = await cache.match("offline.html");
        }
    }

    return response;
}

const urlInFilesToCache = url => {
    const subPath = Object.keys(cacheContentNodes).find(x => url.startsWith(x)); // Empty string or the full url
    const [, , , ...paths] = subPath ? ["", ""].concat(url.split(subPath + "/")) : url.split("/");

    let nodes = cacheContentNodes[subPath];
    let index = 0;
    while (nodes && index < paths.length) {
        const path = paths[index++];
        if (nodes.data.findIndex(x => x == path) < 0) {
            nodes = nodes.children[path];
        }
    }

    return nodes;
};

const handlePushEvent = body =>
    self.registration.showNotification("Credit Savvy Notification", {
        title: "Notification Title",
        body,
        icon: "./Content/Images/favicons/favicon-32.png"
    });

async function handleNotificationClick() {
    const clients = await self.clients.matchAll();                  // Retrieve a list of the clients of this service worker.
    // const focused = clients.some(({focused}) => focused);           // Check if there is at least one focused client.
    
    if (clients.length > 0) {                                       // Focus the first client, if it exists.
        return clients[0].focus();
    }
    return self.clients.openWindow("/");                            // Else open a new page.
}

async function showOfflineIfError(event) {
    l("Calling network", event.request.url);

    let response;

    try {
        response = await fetch(event.request);
    } catch (err) {
        l("Network call failed", err);

        const cache = await caches.open("app-cache");
        response = cache.match("offline.html");
    }

    return response;
}





// const config = {
//     messagingSenderId: "964652296440"
// };
// firebase.initializeApp(config);

// const messaging = firebase.messaging();
// messaging.setBackgroundMessageHandler(payload => {
//     const title = payload.notification.title;
//     console.log("payload in BackgroundMessage", JSON.stringify(payload));
//     const options = {
//         body: payload.notification.body,
//         icon: payload.notification.icon
//     };
//     return self.registration.showNotification(title, options);
// });
