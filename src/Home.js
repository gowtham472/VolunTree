import {React, useState, useEffect } from 'react';
import { auth, db, messaging } from './firebase'; // Firebase config
import { collection, getDoc, doc, getDocs, setDoc } from 'firebase/firestore';
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
      if (user) {
        try {
          const userDocRef = doc(db, 'login_data', user.uid); // Reference to login_data document
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
      }
    };

    fetchUserData();
  }, [user]);

  // Handle profile updates
  const handleProfileUpdate = async () => {
    try {
      const userDocRef = doc(db, 'login_data', user.uid);
      await setDoc(userDocRef, userProfile, { merge: true });
      setShowProfileModal(false); // Close modal on success
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile.');
    }
  };

  // Request notification permission and retrieve FCM token
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
          setFcmToken(token);

          // Save the token to Firestore
          if (token) {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { fcmToken: token }, { merge: true });
          }
        } else {
          console.warn('Notification permission denied');
        }
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    };

    if (user) {
      requestNotificationPermission();
    }
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
          setError('Unable to retrieve location');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Find nearby volunteers
  const findNearbyVolunteers = async () => {
    if (!userLocation) {
      setError('Location is required to find nearby volunteers.');
      return;
    }

    setLoading(true);
    try {
      const volunteersRef = collection(db, 'volunteers');
      const volunteerSnapshot = await getDocs(volunteersRef);
      const nearbyVolunteers = [];

      volunteerSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.location) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            data.location.latitude,
            data.location.longitude
          );
          if (distance <= 10) { // 10 km radius
            nearbyVolunteers.push({ ...data, id: doc.id });
          }
        }
      });

      setVolunteers(nearbyVolunteers);
    } catch (err) {
      setError('Failed to load volunteers.');
    }
    setLoading(false);
  };

  // Calculate distance between two coordinates using the Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header>
        <div className="logo" style={{ display: 'flex', alignItems: 'center',justifyContent: 'space-around' }}>
        <img src={logo} alt="Voluntree Logo" className="app-logo" />
          <h1>VolunTree</h1>
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
      <div className={`modal ${showProfileModal ? 'show' : ''}`}>
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
            placeholder="Mobile"
            value={userProfile.mobile}
            onChange={(e) => setUserProfile({ ...userProfile, mobile: e.target.value })}
          />
          {/* Dropdown for Status */}
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
          <button onClick={handleProfileUpdate}>Save</button>
          <button onClick={() => setShowProfileModal(false)}>Cancel</button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <h2>Welcome to the Volunteer Family</h2>
        <p>"The best way to find yourself is to lose yourself in the service of others." - Mahatma Gandhi</p>
      </section>
      <div className="redirect-button">
      <button onClick={() => navigate('/volunteer-search', { state: { userProfile } })}>
  Go to Volunteer Search
</button>
      </div>
    </div>
  );
};

export default Home;
