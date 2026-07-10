// ScaleUp Chennai Admin Authentication Module
import { 
  auth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from "./firebase.js";
import { showToast } from "./utils.js";

// Mapped admin credentials
const ADMIN_USERNAME = "scaleup";
const ADMIN_EMAIL = "scaleup@scaleup.in";

/**
 * Log in the administrator using Username & Password.
 * @param {string} username - Input username (translates to email in live mode)
 * @param {string} password - Input password
 * @returns {Promise<Object>}
 */
export async function loginAdmin(username, password) {
  const sanitizedUser = username.trim().toLowerCase();
  
  if (sanitizedUser !== ADMIN_USERNAME) {
    const errorMsg = "Invalid username credentials.";
    showToast(errorMsg, "error");
    throw new Error(errorMsg);
  }
  
  try {
    // Authenticate securely with Firebase Authentication mapping username to registered email
    console.log(`[Firebase Auth] Attempting login for admin user mapping: ${ADMIN_EMAIL}`);
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
    showToast("Login successful! Welcome to the Admin Panel.", "success");
    return userCredential;
  } catch (error) {
    console.error("[Firebase Auth] Login failed:", error);
    let friendlyMessage = "Authentication failed. Please verify credentials.";
    
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
      friendlyMessage = "Incorrect password. Please try again.";
    } else if (error.code === 'auth/network-request-failed') {
      friendlyMessage = "Network error. Please check your internet connection.";
    }
    
    showToast(friendlyMessage, "error");
    throw new Error(friendlyMessage);
  }
}

/**
 * Log out the administrator and destroy current session.
 * @returns {Promise<void>}
 */
export async function logoutAdmin() {
  try {
    await signOut(auth);
    showToast("Logged out successfully.", "success");
    window.location.href = "admin.html";
  } catch (error) {
    showToast("Error during logout.", "error");
    console.error("[Firebase Auth] Logout error:", error);
  }
}

/**
 * Setup a route guard for admin dashboard and login pages.
 * @param {string} pageType - 'admin' (for login page) or 'dashboard' (for dashboard page)
 */
export function initRouteGuard(pageType) {
  onAuthStateChanged(auth, (user) => {
    if (pageType === 'dashboard') {
      if (!user) {
        // Not logged in, redirect to login
        showToast("Unauthorized access. Redirecting to admin login.", "warning");
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 1500);
      } else {
        // Double check user mapping
        if (user.email !== ADMIN_EMAIL) {
          showToast("Access Denied: Invalid administrator session.", "error");
          signOut(auth);
        }
      }
    } else if (pageType === 'admin') {
      if (user && user.email === ADMIN_EMAIL) {
        // Already logged in, redirect to dashboard
        window.location.href = "dashboard.html";
      }
    }
  });
}
