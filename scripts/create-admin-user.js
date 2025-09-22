// Script to create admin user in Firestore
// Run with: node scripts/create-admin-user.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    // Replace with your user's UID from Firebase Auth
    const userId = "USER_UID_FROM_FIREBASE_AUTH";
    
    const userData = {
      email: "admin@yourcompany.com",
      displayName: "Admin User",
      role: "admin",
      createdAt: new Date(),
      lastLoginAt: null
    };

    await setDoc(doc(db, "users", userId), userData);
    console.log("✅ Admin user created successfully!");
    console.log("User ID:", userId);
    console.log("User Data:", userData);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  }
}

createAdminUser();
