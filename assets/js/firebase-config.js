/**
 * firebase-config.js
 * Safety Net Configuration
 * Handles Offline Mode gracefully if Firebase is missing.
 */

// 1. YOUR FIREBASE CONFIG
// Replace these values with your actual Firebase Console keys later.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "upsc-pro.firebaseapp.com",
    projectId: "upsc-pro",
    storageBucket: "upsc-pro.appspot.com",
    messagingSenderId: "00000000000",
    appId: "1:0000000000:web:00000000000"
};

// 2. SAFE INITIALIZATION
let app, auth, db;
let isOfflineMode = false;

if (typeof firebase !== 'undefined') {
    try {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log("🔥 Firebase initialized successfully");
    } catch (e) {
        console.warn("⚠️ Firebase init failed (Check keys):", e);
        isOfflineMode = true;
    }
} else {
    console.log("📡 Firebase SDK not found -> Offline Mode Active");
    isOfflineMode = true;
}

// Global Helper to check status
window.isOffline = () => isOfflineMode;
