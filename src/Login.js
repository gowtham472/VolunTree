import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { db } from './firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Email/Password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      const user = auth.currentUser;
      await fetchUserData(user);
    } catch (err) {
      setLoading(false);
      handleFirebaseError(err.code);
    }
  };

  // Fetch user data from Firestore
  const fetchUserData = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      navigate('/home', { state: userData });  // Pass user data to Home
    } else {
      console.log("No user document found in Firestore.");
      // Optionally, handle profile creation if user doesn't exist in Firestore
      alert('Your profile is incomplete. Please update it.');
      navigate('/profile');  // Redirect to a profile completion page
    }
  };

  // Function to handle Firebase error codes
  const handleFirebaseError = (code) => {
    switch (code) {
      case 'auth/user-not-found':
        setError('No account found with this email.');
        break;
      case 'auth/wrong-password':
        setError('Incorrect password. Please try again.');
        break;
      case 'auth/invalid-email':
        setError('Invalid email format.');
        break;
      default:
        setError('Login failed. Please check your credentials.');
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google Sign-In successful:', user);
      // Check if the user exists in Firestore, then navigate to home
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        navigate('/home', { state: userData }); // Pass user data to Home
      } else {
        // If the user doesn't exist in Firestore, prompt them to complete their profile
        alert('Your profile is incomplete. Please update it By clicking on Update Profile.');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error.message);
      setError(error.message); // Display the error from Google Sign-In
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>} {/* Display error message */}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <button onClick={handleGoogleSignIn} className="google-btn">
        Sign in with Google
      </button>

      <button className="emergency-button" onClick={() => navigate('/volunteer-search')}>
        Emergency
      </button>
    </div>
  );
};

export default Login;