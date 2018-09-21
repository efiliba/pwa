import firebase from "firebase/app";
import "firebase/database";
// import "firebase/messaging";

const vapid = {
    publicKey: "BClwiHW1qFq61BDSleQ_hf5pSDnjK_HEuMggyKqSatE7kzm6rvlY61vcrEPctDYfitgszgYaN0RjTknls_6QUDM",
    privateKey: "AvsLSw922tOXbMQG3rGdmvMDfwMoF62zhat8jOrc0-A"
};

const applicationServerKey = urlBase64ToUint8Array(vapid.publicKey);

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const firebaseConfig = {
    apiKey: "AIzaSyD4zTgP0YEX2oVk7FxX2K4iVqZAQavA5aM",
    authDomain: "simply-notify-c05df.firebaseapp.com",
    databaseURL: "https://simply-notify-c05df.firebaseio.com",
    projectId: "simply-notify-c05df",
    storageBucket: "simply-notify-c05df.appspot.com",
    messagingSenderId: "964652296440"
};
firebase.initializeApp(firebaseConfig);

const tokensDbTable = firebase.database().ref("/tokens");
// const messaging = firebase.messaging();

// messaging.usePublicVapidKey(vapid.publicKey);


// messaging.onTokenRefresh(() =>                                  // Callback when token is updated.
//     messaging.getToken()
//         .then(token => {
//             console.log("Token being refreshed: ", token);
//             return tokensDbTable.push({                         // Save token on application server
//                 token,
//                 uid: "The user ID updated"
//             });
//         })
//         .catch(err => console.log("Unable to retrieve refreshed token", err))
// );


// messaging.onMessage(payload => {
//     // Called when page is open instead of notification
//     console.log("Message received FROM SERVER in callback.", payload);
// });

let deferredPrompt;

window.addEventListener("beforeinstallprompt", e => {
    debugger;
    e.preventDefault();
    deferredPrompt = e;
});

export const addToHomeScreen = async () => {
  console.log("addToHomeScreen");
debugger;
  if (deferredPrompt) {
    deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;
    console.log(`Add to Home Screen ${choiceResult.outcome}`);
    deferredPrompt = null;
  }
};
    
export const subscribeToNotifications = async uid => {
  if (!("Notification" in window)) {
    console.log("Push notifications not supported");
  } else {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Permission granted");

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({userVisibleOnly: true, applicationServerKey});
        
        return tokensDbTable.push({                        
          uid,
          subscription: JSON.stringify(subscription)                // Save the subscription object
        });
      }
    } catch(error) {
      debugger;
      console.log(error);
    }
  }
};

// export const unsubscribeFromNotifications = () =>
//     messaging.getToken()
//         .then(messaging.deleteToken)
//         .then(() => tokensDbTable
//             .orderByChild("uid")
//             // .equalTo(auth.currentUser.uid)
//             .once("value")
//         )
//         .then(snapshot => {
//             const [firstKey] = Object.keys(snapshot.val());
//             return tokensDbTable.child(firstKey).remove();
//         })
//         // .then(checkSubscription)
//         .catch(err => console.log("error deleting token", err));
