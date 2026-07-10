// ScaleUp Chennai Firebase SDK Initialization (Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  onSnapshot, 
  runTransaction,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ScaleUp Chennai Firebase Project Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCo8o0_MlQv_dYSb1TM85Wf6EAHppYLxsw",
  authDomain: "scaleup-chennai.firebaseapp.com",
  projectId: "scaleup-chennai",
  storageBucket: "scaleup-chennai.firebasestorage.app",
  messagingSenderId: "424761052483",
  appId: "1:424761052483:web:cc1b5cfcfdfac1015f33f6",
  measurementId: "G-VPFS9SSS2X"
};

console.log("Firebase Config:", firebaseConfig);
console.log("API Key:", firebaseConfig.apiKey);
// Initialize Live Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export instances and functions
export { 
  app, 
  auth, 
  db,
  // Auth Functions
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  // Firestore Database Functions
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  writeBatch,
  serverTimestamp
};
