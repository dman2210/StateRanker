// Authentication methods - based on firebase_barebones_javascript integration
import { 
  signInWithRedirect, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// Google Sign In
export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

// Email/Password Sign In
export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Email/Password Sign Up
export function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Phone Sign In
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'normal',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      // Response expired
    }
  });
}

export function signInWithPhone(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

// Handle redirect result - based on firebase_barebones_javascript integration
export function handleRedirect() {
  getRedirectResult(auth)
    .then((result) => {
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
        console.log('Redirect sign-in successful:', user);
      }
    })
    .catch((error) => {
      console.error('Redirect sign-in error:', error);
    });
}