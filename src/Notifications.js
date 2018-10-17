import firebase from "firebase/app";
import "firebase/database";

const applicationServerKey = new Uint8Array([
  4, 41, 112, 136, 117, 181, 168, 90, 186, 212, 16, 210, 149, 228, 63, 133, 254, 105, 72, 57, 227, 43,
  241, 196, 184, 200, 32, 200, 170, 146, 106, 209, 59, 147, 57, 186, 174, 249, 88, 235, 91, 220, 172,
  67, 220, 180, 54, 31, 138, 216, 44, 206, 6, 26, 55, 68, 99, 78, 73, 229, 179, 254, 144, 80, 51
]);

const firebaseConfig = {
  apiKey: "AIzaSyD4zTgP0YEX2oVk7FxX2K4iVqZAQavA5aM",
  authDomain: "simply-notify-c05df.firebaseapp.com",
  databaseURL: "https://simply-notify-c05df.firebaseio.com",
  projectId: "simply-notify-c05df"
};
firebase.initializeApp(firebaseConfig);

const tokensDbTable = firebase.database().ref("/tokens");

let deferredPrompt;

window.addEventListener("beforeinstallprompt", e => {
    console.log("Add to Home Screen activated. Saving message prompt.");
    e.preventDefault();
    deferredPrompt = e;
});

export const addToHomeScreen = async () => {
  console.log("addToHomeScreen checking if Add to Home Screen activated.");

  if (deferredPrompt) {
    deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;
    console.log(`Add to Home Screen ${choiceResult.outcome}`);
    deferredPrompt = null;
  }
};

export const pushNotificationsSupported = () => "Notification" in window;

export const updateSubscription = async uid => {                    // unsubscribe subscription if it exists, before re-subscribing
  try {
    await unsubscribeFromNotifications(uid);

    if (Notification.permission == "granted") {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({userVisibleOnly: true, applicationServerKey});

      const {endpoint, keys: {p256dh, auth}} = subscription.toJSON();
      console.log(endpoint);
      console.log(p256dh);
      console.log(auth);
      console.log("-------------------------------------");

      return tokensDbTable.push({uid, endpoint, p256dh, auth});
    }
  } catch(error) {
    debugger;
    console.log("Error updating subscription", error);
  }
};

export const subscribeToNotifications = async uid => {
  try {
    const permission = await Notification.requestPermission();
    if (permission == "granted") {
      console.log("Permission granted");
      updateSubscription(uid);                                      // unsubscribe before subscribing incase subscription exists
    }
  } catch(error) {
    debugger;
    console.log("Error subscribing to Push Notifications", error);
  }
};

export const unsubscribeFromNotifications = async uid => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      const snapshot = await tokensDbTable                            // Remove subscription from database
        .orderByChild("uid")
        // .equalTo(auth.currentUser.uid)
        .once("value");

      const entry = snapshot.exists() && Object.entries(snapshot.val()).find(([, value]) => value.endpoint == subscription.endpoint);
      if (entry) {
        return tokensDbTable.child(entry[0]).remove();
      }
    }
  } catch (error) {
    console.log("Error unsubscribing", error)
  }
};

export const logSubscriptionObjects = async () => {
  const data = await tokensDbTable.once("value");

  Object.values(data.val()).forEach(({uid, endpoint, p256dh, auth}) => {
    console.log(endpoint);
    console.log(p256dh);
    console.log(auth);
    console.log("-------------------------------------");
  });
};
