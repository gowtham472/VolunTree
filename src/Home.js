import React, { useState, useEffect } from 'react';
import { auth, db, messaging } from './firebase'; // Firebase config
import { collection, getDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { useNavigate } from 'react-router-dom';
import './App.css';

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
    location: '',
    address: '',
    phoneNumber: '',
    status: ''
  });

  // Handle logout and redirect
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login'); // Redirect to login page
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
              name: userData.name || user.email, // Fallback to email if name doesn't exist
              email: user.email,
              location: userData.location || '',
              address: userData.address || '',
              phoneNumber: userData.phoneNumber || '',
              status: userData.status || 'Explorer' // Default status as Explorer
            });
          } else {
            setUserProfile({
              name: user.email,
              email: user.email,
              location: '',
              address: '',
              phoneNumber: '',
              status: 'Explorer'
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
        <div className="logo">
          <h1>Voluntree</h1>
        </div>
        <div className="profile">
          <button onClick={handleLogout}>Log Out</button>
          <div className="profile-info">
            <h3>{userProfile.name}</h3> {/* Display user's name */}
            <p>{userProfile.email}</p> {/* Optionally display email */}
            <p>{userProfile.location ? `Location: ${userProfile.location}` : 'Location not set'}</p>
            <p>{userProfile.address ? `Address: ${userProfile.address}` : 'Address not set'}</p>
            <p>{userProfile.phoneNumber ? `Phone: ${userProfile.phoneNumber}` : 'Phone number not set'}</p>
            <p>Status: {userProfile.status}</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h2>Welcome to the Volunteer Family</h2>
        <p>"The best way to find yourself is to lose yourself in the service of others." - Mahatma Gandhi</p>
      </section>

      {/* Emergency Button and Search Volunteers */}
      <div className="emergency-loader">
        <h3>Find Nearby Volunteers</h3>
        <button onClick={findNearbyVolunteers} disabled={loading}>
          {loading ? 'Loading...' : 'Find Volunteers'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      {/* Volunteers List */}
      <div className="volunteers-list">
        {volunteers.length > 0 ? (
          <ul>
            {volunteers.map((vol) => (
              <li key={vol.id}>
                {vol.name} ({vol.email}) - Location: {vol.location.latitude}, {vol.location.longitude}
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>No nearby volunteers found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
