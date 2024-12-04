import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import routing tools
import { auth } from './firebase'; // Firebase setup
import WelcomePage from './Welcome';
import Login from './Login';
import SignUp from './SignUp';
import Home from './Home';
import VolunteerSearch from './VolunteerSearch';
import CreatePost from './volun_post/CreatePost';
import Events from './volun_post/Events';
import SubmitPayment from './volun_post/SubmitPayment';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showWelcomePage, setShowWelcomePage] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleAuthMode = () => {
    setShowSignUp((prev) => !prev);
  };

  const handleGetStarted = () => {
    setShowWelcomePage(false);
  };

  return (
    <div className="App">
      <div className="app-container">
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
          <Route path="/volunteer-search" element={ <VolunteerSearch />} />
          <Route path="/create-post" element={user ? <CreatePost /> : <Navigate to="/login" />} />
          <Route path="/events" element={user ? <Events /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit-payment" element={<SubmitPayment />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
