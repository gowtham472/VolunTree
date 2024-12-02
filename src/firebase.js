import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { getMessaging } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';  

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkD-tmZNQKwtvk0mSF0qY3Y96ph4_AMjQ",
  authDomain: "voluntree-3eab8.firebaseapp.com",
  projectId: "voluntree-3eab8",
  storageBucket: "voluntree-3eab8.firebasestorage.app",
  messagingSenderId: "414645145989",
  appId: "1:414645145989:web:cad0e6b79b44d2a29534ec",
  measurementId: "G-53FRTN4T8Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const messaging = getMessaging(app);
const storage = getStorage(app);

// Export necessary modules
export { messaging, auth, db, googleProvider,storage, createUserWithEmailAndPassword, setDoc, doc };
