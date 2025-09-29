import admin from 'firebase-admin';

// Initialize Firebase Admin SDK with basic configuration
// For development on Replit, we'll use a simpler approach
if (!admin.apps.length) {
  try {
    // Initialize with minimal configuration
    // This will only work for token verification, not Firestore operations
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      // For Replit development, we'll skip the service account for now
    });
    console.log('Firebase Admin initialized for project:', process.env.VITE_FIREBASE_PROJECT_ID);
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Get auth instance (this should work for token verification)
export const auth = admin.auth();

// Note: Firestore operations may not work without proper credentials
// For now, we'll skip Firestore and use a simpler storage approach
export const db = null; // Disable Firestore for now

export default admin;