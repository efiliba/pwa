const vapid = {
  publicKey: "BClwiHW1qFq61BDSleQ_hf5pSDnjK_HEuMggyKqSatE7kzm6rvlY61vcrEPctDYfitgszgYaN0RjTknls_6QUDM",
  privateKey: "AvsLSw922tOXbMQG3rGdmvMDfwMoF62zhat8jOrc0-A"
};

const firebaseConfig = {
  apiKey: "AIzaSyD4zTgP0YEX2oVk7FxX2K4iVqZAQavA5aM",
  authDomain: "simply-notify-c05df.firebaseapp.com",
  databaseURL: "https://simply-notify-c05df.firebaseio.com",
  projectId: "simply-notify-c05df",
  storageBucket: "simply-notify-c05df.appspot.com",
  messagingSenderId: "964652296440"
};

const urlBase64ToUint8Array = base64String => {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const applicationServerKey = urlBase64ToUint8Array(vapid.publicKey);
