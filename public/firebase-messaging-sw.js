/* global importScripts, firebase */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAwaHeEJppwyRnzTzgrNhBnvdg7na8948M",
  authDomain: "mobilehealth-a2112.firebaseapp.com",
  projectId: "mobilehealth-a2112",
  storageBucket: "mobilehealth-a2112.firebasestorage.app",
  messagingSenderId: "431964780507",
  appId: "1:431964780507:web:da9a556813c6acb06cd9fe",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Notification";
  const options = {
    body: payload.notification?.body || "",
    icon: "/icons/icon-192x192.png",
  };
  self.registration.showNotification(title, options);
});
