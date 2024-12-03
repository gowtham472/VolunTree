import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import routing tools
import { auth } from './firebase'; // Firebase setup
import WelcomePage from './Welcome';
import Login from './Login';
import SignUp from './SignUp';
import Home from './Home';
import Emergency from './emergency'; // Import the Emergency component
import VolunteerSearch from './VolunteerSearch';
import CreatePost from './volun_post/CreatePost';
import Events from './volun_post/Events';
import './App.css';
import './volun_post/CreatePost.js';
import SubmitPayment from'./volun_post/SubmitPayment.js';



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
      <div className="app-container">
        <Routes>
          {/* Home Route */}
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
          
          {/* Protected Route for Volunteer Search */}
          <Route
            path="/volunteer-search"
            element={user ? <VolunteerSearch /> : <Navigate to="/login" />}
          />
          
          {/* Create Post Route */}
          <Route
            path="/create-post"
            element={user ? <CreatePost /> : <Navigate to="/login" />}
          />
          
          {/* Protected Route for Events - Only accessible if user is logged in and profile is completed */}
          <Route
            path="/events"
            element={
              user ? (
                user.displayName && user.email ? <Events /> : <Navigate to="/home" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/*Login Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/submit-payment" element={<SubmitPayment />} />
        <Route path="/create-post" element={<CreatePost />} />
          </Routes>
      </div>
    </div>
  );
}

export default App;
