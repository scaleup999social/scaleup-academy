/**
 * ScaleUp Chennai Admin Seeding Script
 * 
 * To run this script and seed the administrator account:
 * 1. Make sure Node.js is installed.
 * 2. Run: npm install firebase
 * 3. Fill in your Firebase Config details below.
 * 4. Run: node scripts/seed-admin.js
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// REPLACE WITH YOUR ACTUAL FIREBASE CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyCo8o0_MlQv_dYSb1TM85Wf6EAHppYLxsw",
  authDomain: "scaleup-chennai.firebaseapp.com",
  projectId: "scaleup-chennai",
  storageBucket: "scaleup-chennai.firebasestorage.app",
  messagingSenderId: "424761052483",
  appId: "1:424761052483:web:cc1b5cfcfdfac1015f33f6"
};

const ADMIN_EMAIL = "scaleup@scaleup.in";
const ADMIN_PASSWORD = "scaleup@999";

async function seedAdmin() {
  console.log("Initializing Firebase App...");
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  console.log(`Attempting to seed administrator: ${ADMIN_EMAIL}...`);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("--------------------------------------------------");
    console.log("🎉 SUCCESS: Administrator account seeded successfully!");
    console.log(`User ID: ${userCredential.user.uid}`);
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ ERROR: Failed to seed admin account.");
    if (error.code === 'auth/email-already-in-use') {
      console.log("Admin email is already registered in Firebase Authentication.");
    } else {
      console.error(error.message);
    }
  }
}

// Check if running in browser or Node environment
if (typeof window !== "undefined") {
  console.log("To run in browser dev tools, paste the code inside seedAdmin() directly into the console.");
} else {
  seedAdmin();
}
