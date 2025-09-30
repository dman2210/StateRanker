// Firebase configuration - based on firebase_barebones_javascript integration
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider, PhoneAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
console.log("here is the env.", import.meta.env);
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider();
export const phoneProvider = new PhoneAuthProvider(auth);

export default app;