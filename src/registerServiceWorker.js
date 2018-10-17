export const register = async () => {
  if ("serviceWorker" in navigator) {
    console.log("Registering SW");

    try {
      const reg = await navigator.serviceWorker.register("/service-worker.js", {scope: "/"});
      console.log("SW registered");
  
      reg.onupdatefound = () => {                                     // Triggers when new service worker is different to previous one
        const sw = reg.installing;
        sw.onstatechange = () => {                                    // Detect when state changes from installing to installed
          if (sw.state == "installed") {
            if (navigator.serviceWorker.controller) {                 // sw was previously loaded and cached
              console.log("A new version is available.");
            } else {
              console.log("Content is now offline.");                 // First sw installed
            }
          }
        };
      };
    } catch(error) {
      console.error("Error during service worker registration:", error);
    }
  }
};

export const unregister = async () => {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.unregister();
  }
};
