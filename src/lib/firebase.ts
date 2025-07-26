import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAobb3hUqqNxNPT5jRvnhTVJZsCD_y46Ss",
  authDomain: "system-kepolisian.firebaseapp.com",
  projectId: "system-kepolisian",
  storageBucket: "system-kepolisian.firebasestorage.app",
  messagingSenderId: "393672829333",
  appId: "1:393672829333:web:d4ac305b7f74d8bfff6e9c",
  measurementId: "G-B9HPX37TBJ",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const requestNotificationPermission = async () => {
  if (typeof window === "undefined") {
    console.warn("Not running in browser.");
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    console.warn("This browser does not support Firebase Messaging.");
    return null;
  }

  try {
    const messaging = getMessaging(app);

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission not granted.");
      return null;
    }

    const swReg =
      (await navigator.serviceWorker.getRegistration(
        "/firebase-messaging-sw.js"
      )) ??
      (await navigator.serviceWorker.register("/firebase-messaging-sw.js"));

    const token = await getToken(messaging, {
      vapidKey:
        "BFroGg8ta_44f0CmIOdsdU630fMnFrLKo00xdfWhw8msOokCs4KeCTU2jh-KCA1FPgyx5roAph2QFWL_ZKVfZv0",
      serviceWorkerRegistration: swReg,
    });

    return token || null;
  } catch (error) {
    console.error("Error requesting Firebase messaging token:", error);
    return null;
  }
};
