import React from 'react';
import { auth, googleProvider } from './firebase'; 
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const GoogleSignIn = ({ setUser }) => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Set user data (name, email, etc.)
      setUser({
        name: user.displayName,  // Get the name from Google Sign-In
        email: user.email,
        uid: user.uid,
      });

      // Navigate to Home page after successful sign-in
      navigate('/home');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <button onClick={handleGoogleSignIn} className="google-btn">
      Sign in with Google
    </button>
  );
};

export default GoogleSignIn;
