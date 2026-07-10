# ScaleUp Chennai – Digital Marketing Academy Web App

A premium, fully responsive, glassmorphic registration web application for ScaleUp Chennai Digital Marketing Academy. Includes a startup-themed landing page, a progressive candidate application form with localStorage auto-save, custom monthly-resettable numeric ID generation, and an administrator dashboard with real-time analytics visualizations.

---

## 📂 Project Architecture

```
scaleup-chennai/
├── index.html          # Startup Landing Page
├── register.html       # Progressive Multi-step Registration Form
├── admin.html          # Secure Admin Portal Sign-In Card
├── dashboard.html      # Administrator Analytics Panel
├── style.css           # Global Theme & Glassmorphic Stylesheets
├── responsive.css      # Responsiveness Layouts
├── firebase.js         # Firebase App & Service Client Configs
├── auth.js             # Authentication Management & Route Guards
├── dashboard.js        # Dashboard real-time listeners & Chart integrations
├── app.js              # Header animations & general page controllers
├── utils.js            # Toast popups, input sanitizers & printable slip engine
├── firestore.rules     # Database Access Rules
├── firebase.json       # Firebase Hosting Rules
├── README.md           # Setup instructions
└── scripts/
    └── seed-admin.js   # Admin user seeding console script
```

---

## ⚡ Setup & Configuration Guide

### Step 1: Firebase Project Creation
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named `scaleup-chennai`.
3. Enable **Authentication** and activate the **Email/Password** sign-in provider.
4. Enable **Cloud Firestore** in Production mode.

### Step 2: Initialize Firebase Configs in Project
1. Open the [firebase.js](file:///d:/New%20folder/firebase.js) file.
2. Locate the `firebaseConfig` block.
3. Replace the placeholder config strings with your actual Firebase Project credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### Step 3: Seed the Administrator Account
The Admin panel restricts entry to username `scaleup` and password `scaleup@999`. In client JS, this username translates to email `scaleup@scaleup.in`.
To register this credentials set:

#### Option A: Quick Browser Console Seeding (Recommended)
1. Open `index.html` in your browser.
2. Press `F12` or right-click and choose **Inspect** to open Developer Console.
3. Paste the following script directly in the console and hit enter:
   ```javascript
   import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
   import { app } from "./firebase.js";
   const auth = getAuth(app);
   createUserWithEmailAndPassword(auth, "scaleup@scaleup.in", "scaleup@999")
     .then(cred => console.log("Admin seeded! ID:", cred.user.uid))
     .catch(err => console.error("Seeding failed:", err.message));
   ```

#### Option B: Using Node.js Seeding Script
1. Navigate to the project directory and install the firebase SDK:
   ```bash
   npm install firebase
   ```
2. Replace credentials inside [scripts/seed-admin.js](file:///d:/New%20folder/scripts/seed-admin.js) with your project configuration.
3. Run the script:
   ```bash
   node scripts/seed-admin.js
   ```

### Step 4: Publish Firestore Security Rules
Deploy the rules written in [firestore.rules](file:///d:/New%20folder/firestore.rules) to protect applicant listings. You can copy the code directly into the Firestore **Rules** tab in the Firebase Console.

---

## 🔒 Security Features
1. **Uniqueness Enforcements**: Direct client transactions prevent duplicate registrations using the same mobile or email address. The database maintains lookups inside `/uniqueEmails` and `/uniqueMobiles` check collections.
2. **Access Locks**: Direct registration reads are forbidden. Non-authenticated users cannot access administrative collections or details.
3. **Monthly Reset Counter**: Firestore transactions update the active period counter (`registrationCounter/{YYMM}`) atomically, preventing index overlaps or number collisions.
