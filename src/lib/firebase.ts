import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Singleton Firebase app. Safe for client and server (when env vars are present).
 */
function getFirebaseApp(): FirebaseApp | null {
  if (getApps().length > 0) {
    return getApps()[0] as FirebaseApp;
  }
  const hasConfig = Object.values(firebaseConfig).every(Boolean);
  if (!hasConfig) return null;
  return initializeApp(firebaseConfig);
}

/**
 * Firebase Auth instance. Returns null if Firebase is not configured.
 */
export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

/**
 * Firestore instance. Returns null if Firebase is not configured.
 */
export function getFirebaseFirestore(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export { getFirebaseApp };
