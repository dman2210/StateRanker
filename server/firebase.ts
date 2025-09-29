import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // For Replit, we can use the same project ID from environment variables
  // In production, you would typically use a service account key file
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

// Get Firestore instance
export const db = admin.firestore();
export const auth = admin.auth();

export default admin;