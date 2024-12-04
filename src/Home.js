import React, { useState, useEffect } from 'react';
import { auth, db, messaging } from './firebase'; // Firebase config
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { useNavigate } from 'react-router-dom';
import './App.css';
import logo from './applogo.png';

const Home = ({ user }) => {
  const navigate = useNavigate(); // Navigation hook

  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState('');
  const [fcmToken, setFcmToken] = useState('');
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    status: 'Explorer',
    mobile: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
  });
  const [showProfileModal, setShowProfileModal] = useState(false); // Profile modal state

  // Handle logout and redirect
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/'); // Redirect to login page
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // Fetch the user's profile from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;  // Prevents accessing user.uid if user is undefined
      try {
        const userDocRef = doc(db, 'login_data', user.uid); // Reference to users document
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserProfile({
            name: userData.name || user.displayName,
            email: user.email,
            status: userData.status || 'Explorer',
            mobile: userData.mobile || '',
            addressLine1: userData.addressLine1 || '',
            addressLine2: userData.addressLine2 || '',
            city: userData.city || '',
            state: userData.state || '',
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data.');
      }
    };

    fetchUserData();
  }, [user]);

  // Handle profile updates
  const handleProfileUpdate = async () => {
    if (!userProfile.name || !userProfile.email) {  // Basic validation
      alert('Name and Email are required.');
      return;
    }
    setLoading(true); // Start loading
    try {
      const userDocRef = doc(db, 'login_data', user.uid);
      await setDoc(userDocRef, userProfile, { merge: true });
      setShowProfileModal(false); // Close modal on success
    } catch (error) {
      console.error('Profile update failed:', error.message);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Request notification permission and retrieve FCM token
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (!user) return;  // Prevent execution if user is undefined
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, { vapidKey: 'BGPTxFCZ4qgOroykFGyi-qppxGj2YgKxN2qNJOqBTH6yWIYSMq8dGuVh_9TfLpuzX-rjj4ImDWfbxqksLMbEy0o' });
          setFcmToken(token);

          // Save the token to Firestore
          if (token) {
            const userRef = doc(db, 'login_data', user.uid);
            await setDoc(userRef, { fcmToken: token }, { merge: true });
          }
        } else {
          console.warn('Notification permission denied');
        }
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    };

    requestNotificationPermission();
  }, [user]);

  // Fetch user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error.message);
          setError('Unable to retrieve location: ' + error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <div className="home-container">
      {/* Header */}
      <header>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <img src={logo} alt="Voluntree Logo" className="app-logo" />
          <h1 style={{ color: 'gold' }}>VolunTree</h1>
        </div>
        <div className="profile">
          <button onClick={() => setShowProfileModal(true)}>Edit Profile</button>
          <button onClick={handleLogout}>Log Out</button>
          <div className="profile-info">
            <h3>{userProfile.name}</h3> {/* Display user's name */}
            <p>{userProfile.email}</p> {/* Optionally display email */}
            <p>Status: {userProfile.status}</p>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal show">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <input
              type="text"
              placeholder="Name"
              value={userProfile.name}
              onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Email"
              value={userProfile.email}
              onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Mobile"
              value={userProfile.mobile}
              onChange={(e) => setUserProfile({ ...userProfile, mobile: e.target.value })}
            />
            <select
              value={userProfile.status}
              onChange={(e) => setUserProfile({ ...userProfile, status: e.target.value })}
            >
              <option value="Explorer">Explorer</option>
              <option value="Volunteer">Volunteer</option>
            </select>
            <input
              type="text"
              placeholder="Address Line 1"
              value={userProfile.addressLine1}
              onChange={(e) => setUserProfile({ ...userProfile, addressLine1: e.target.value })}
            />
            <input
              type="text"
              placeholder="Address Line 2"
              value={userProfile.addressLine2}
              onChange={(e) => setUserProfile({ ...userProfile, addressLine2: e.target.value })}
            />
            <input
              type="text"
              placeholder="City"
              value={userProfile.city}
              onChange={(e) => setUserProfile({ ...userProfile, city: e.target.value })}
            />
            <input
              type="text"
              placeholder="State"
              value={userProfile.state}
              onChange={(e) => setUserProfile({ ...userProfile, state: e.target.value })}
            />
            <button onClick={handleProfileUpdate} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setShowProfileModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <h2>Welcome to the Volunteer Family</h2>
        <p>"The best way to find yourself is to lose yourself in the service of others." - Mahatma Gandhi</p>
      </section>

      {/* Navigation Buttons */}
      <div className="redirect-button">
        <button onClick={() => navigate('/volunteer-search', { state: { userProfile } })}>
          Go to Volunteer Search
        </button>
        <button onClick={() => navigate('/events', { state: { userProfile } })}>
          Go to Events
        </button>
      </div>
    </div>
  );
};

export default Home;
