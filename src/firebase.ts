import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

// ✅ Your Firebase config (copy exactly from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAwaHeEJppwyRnzTzgrNhBnvdg7na8948M",
  authDomain: "mobilehealth-a2112.firebaseapp.com",
  projectId: "mobilehealth-a2112",
  storageBucket: "mobilehealth-a2112.firebasestorage.app",
  messagingSenderId: "431964780507",
  appId: "1:431964780507:web:da9a556813c6acb06cd9fe",
  measurementId: "G-DTD9DYJSXL"
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Messaging must be initialized *only if supported*
let messaging: any = null;

export async function getMessagingInstance() {
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
    }
  } catch (_) {
    messaging = null;
  }
  return messaging;
}

export { messaging };
