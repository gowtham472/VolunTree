import React, { useState, useEffect } from 'react';
import {  Routes, Route } from 'react-router-dom'; // Import routing tools
import { auth } from './firebase'; // Firebase setup
import WelcomePage from './Welcome';
import Login from './Login';
import SignUp from './SignUp';
import Home from './Home';
import Emergency from './emergency'; // Import the Emergency component
import VolunteerSearch from './VolunteerSearch';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showWelcomePage, setShowWelcomePage] = useState(true); // Control welcome page display

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleAuthMode = () => {
    setShowSignUp((prev) => !prev);
  };

  // Hide Welcome Page
  const handleGetStarted = () => {
    setShowWelcomePage(false);
  };

  return (
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              showWelcomePage ? (
                <WelcomePage onGetStarted={handleGetStarted} />
              ) : user ? (
                <Home user={user} />
              ) : showSignUp ? (
                <>
                  <SignUp />
                  <p>
                    Already have an account?{' '}
                    <button onClick={toggleAuthMode} className='signup-link'>Login</button>
                  </p>
                </>
              ) : (
                <>
                  <Login />
                  <p>
                    Don't have an account?{' '}
                    <button onClick={toggleAuthMode} className='signup-link'>Sign Up</button>
                  </p>
                </>
              )
            }
          />
          {/* Emergency Route */}
          <Route path="/emergency" element={<Emergency />} />
          {/* Home Route */}
          <Route path="/home" element={<Home />} />
          {/* Login Route */}
          <Route path="/login" element={<App />} />
          <Route path="/volunteer-search" element={<VolunteerSearch />} />
        </Routes>
      </div>
  );
}

export default App;
