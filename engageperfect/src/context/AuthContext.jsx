/**
 * File: AuthContext.jsx
 * Version: 1.0.3
 * Purpose: Authentication context for the entire application.
 * Manages user authentication state and provides auth-related functions.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail
} from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { Navigate, useLocation } from 'react-router-dom';

// Create auth context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  // Also creates a user document in firestore
  const signup = async (email, password) => {
    try {
      // Create the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(userCredential.user, { displayName: email.split('@')[0] });
      
      // Create a user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        createdAt: new Date(),
        plan_type: 'free',
        requests_used: 0,
        requests_limit: 25,
        preferences: {}
      });
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  // In AuthContext.jsx, add this function:
  const updateUserProfile = async (userData) => {
    try {
      // Update Firebase Auth profile (display name, photo URL)
      await updateProfile(auth.currentUser, {
        displayName: userData.displayName,
        ...(userData.photoURL && { photoURL: userData.photoURL })
      });
      
      // If email is changing, update it separately
      if (userData.email && userData.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, userData.email);
      }
      
      // Update Firestore document if needed
      if (userData.preferences) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          displayName: userData.displayName,
          email: userData.email || auth.currentUser.email,
          preferences: userData.preferences
        });
      }
      
      // Make sure to update the local user state
      setUser({
        ...auth.currentUser,
        ...userData
      });
      
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Add it to the context value object:
  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateProfile: updateUserProfile // Export as updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// RequireAuth component for protected routes
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show loading state while authentication is being checked
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    // Redirect to the login page with a return url if user is not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}