/**
 * File: firebase.js
 * Version: 1.0.0
 * Purpose: Firebase configuration and service initialization.
 * Exports initialized Firebase services for authentication and Firestore.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAboJ3IB1MM3GkOBwC1RTjzgvAGo2ablTo",
  authDomain: "engperfecthlc.firebaseapp.com",
  projectId: "engperfecthlc",
  storageBucket: "engperfecthlc.firebasestorage.app",
  messagingSenderId: "503333252583",
  appId: "1:503333252583:web:633b5ce3ba3619df572142",
  measurementId: "G-W98PHG26B4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { auth, db, analytics, storage };
export default app;