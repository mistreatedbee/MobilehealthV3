// Web Firebase for notifications on the browser
import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAwaHeEJppwyRnzTzgrNhBnvdg7na8948M",
  authDomain: "mobilehealth-a2112.firebaseapp.com",
  projectId: "mobilehealth-a2112",
  storageBucket: "mobilehealth-a2112.firebasestorage.app",
  messagingSenderId: "431964780507",
  appId: "1:431964780507:web:da9a556813c6acb06cd9fe",
  measurementId: "G-DTD9DYJSXL",
};

export const app = initializeApp(firebaseConfig);

// Initialize messaging asynchronously to avoid top-level await
let messagingInstance = null;

export async function getMessagingInstance() {
  if (messagingInstance !== null) return messagingInstance; // Return cached instance

  try {
    const supported = await isSupported();
    if (supported) {
      messagingInstance = getMessaging(app);
    }
  } catch (error) {
    console.warn("Firebase messaging not supported:", error);
  }

  return messagingInstance;
}