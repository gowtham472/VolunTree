import React from 'react';
import { auth, googleProvider, db } from './firebase'; // Import Firestore (db)
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore functions
import { useNavigate } from 'react-router-dom';

const GoogleSignIn = ({ setUser }) => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Ensure name and email are set
      const userData = {
        name: user.displayName || 'Anonymous', // Fallback if displayName is missing
        email: user.email,
        uid: user.uid,
      };

      // Save to Firestore or update if the document exists
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // If the user does not exist in Firestore, create a new document
        await setDoc(userRef, {
          name: user.displayName || 'Anonymous',
          email: user.email,
          status: 'active', // Initial status
        });
      }

      // Set user in state for immediate use in your app
      setUser(userData);

      // Navigate to Home page after successful sign-in
      navigate('/home');
    } catch (error) {
      console.error('Google Sign-In error:', error);
      alert('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <button onClick={handleGoogleSignIn} className="google-btn">
      Sign in with Google
    </button>
  );
};

export default GoogleSignIn;
