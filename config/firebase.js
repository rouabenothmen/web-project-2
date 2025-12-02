// Import core Firebase services
import { initializeApp } from "firebase/app";

// Import Firebase features you want to use
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-i_VIZBY8ch_4e9ESofx3GKOHNyN-IT0",
  authDomain: "studyhub-d56f4.firebaseapp.com",
  projectId: "studyhub-d56f4",
  storageBucket: "studyhub-d56f4.firebasestorage.app",
  messagingSenderId: "922472024808",
  appId: "1:922472024808:web:1bc53c3792735f2d4bd75d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services to use in your components
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
