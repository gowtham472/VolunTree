import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase'; // Firebase configuration
import './VolunteerSearch.css'; // Custom styles
import L from 'leaflet'; // Leaflet for mapping
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import OpenVINOAI from './openvino'; // Placeholder for OpenVINO integration

const VolunteerSearch = () => {
  const navigate = useNavigate();
  const [disasterTitle, setDisasterTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });
  const [volunteers, setVolunteers] = useState([]);
  const [availableVolunteers, setAvailableVolunteers] = useState([]); // New state for available volunteers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noVolunteers, setNoVolunteers] = useState(false); // State for checking if relevant volunteers were found

  // Fetch user's current location on component load and get user data from Firebase
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          getUserData(position.coords.latitude, position.coords.longitude);
        },
        () => setError('Unable to retrieve location.')
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Fetch user data from Firebase (login_data collection)
  const getUserData = async (latitude, longitude) => {
    try {
      const q = query(collection(db, 'login_data'), where('status', '==', 'volunteer'));
      const querySnapshot = await getDocs(q);

      const allAvailableVolunteers = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Store available volunteers for later display
        allAvailableVolunteers.push({ ...data, id: doc.id });
      });
      setAvailableVolunteers(allAvailableVolunteers);
    } catch (err) {
      setError('Error fetching user data from Firebase.');
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNoVolunteers(false); // Reset the state for "No Volunteers Found"

    try {
      const volunteerRef = collection(db, 'volunteer');
      const volunteerSnapshot = await getDocs(volunteerRef);
      const fetchedVolunteers = [];
      const allAvailableVolunteers = [];

      volunteerSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Check if the volunteer is available (status should be 'volunteer')
        if (data.status !== 'volunteer') return;

        // Add to the list of all available volunteers
        allAvailableVolunteers.push({ ...data, id: doc.id });

        // Calculate distance between user and volunteer
        const distance = calculateDistance(
          userLocation.latitude, userLocation.longitude,
          data.location.latitude, data.location.longitude
        );

        // OpenVINO-based filtering considering past work
        const isRelevant = OpenVINOAI.evaluateVolunteer(data.pastWork, disasterTitle, description); 

        // Only add volunteers who are nearby and relevant
        if (distance <= 10 && isRelevant) {
          fetchedVolunteers.push({ ...data, id: doc.id });
        }
      });

      // If no relevant volunteers are found, show all available volunteers
      if (fetchedVolunteers.length === 0) {
        setVolunteers(allAvailableVolunteers);
        setNoVolunteers(true);
      } else {
        setVolunteers(fetchedVolunteers);
        setNoVolunteers(false);
      }

      setAvailableVolunteers(allAvailableVolunteers);
      setLoading(false);
    } catch (err) {
      setError('Error fetching volunteers.');
      setLoading(false);
    }
  };

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => x * Math.PI / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Function to convert address to coordinates using Nominatim API
  const getCoordinatesFromAddress = async (address) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      } else {
        setError('Could not find location.');
        return null;
      }
    } catch (error) {
      setError('Error fetching location from Nominatim.');
      return null;
    }
  };

  return (
    <div className="volunteer-search-container">
      <h2>Find Volunteers for Disaster Relief</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <select value={disasterTitle} onChange={(e) => setDisasterTitle(e.target.value)} required>
          <option value="">Select Disaster Title</option>
          <option value="Earthquake">Earthquake</option>
          <option value="Flood">Flood</option>
          <option value="Fire">Fire</option>
          <option value="Others">Others</option>
        </select>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        {/* Location field is now automatically filled */}
        <input
          type="text"
          placeholder="Location (Auto-detected)"
          value={`Lat: ${userLocation.latitude}, Lon: ${userLocation.longitude}`}
          readOnly
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search Volunteers'}
        </button>
      </form>

      {/* Map Section */}
      <div id="map">
        {noVolunteers ? (
          <p>No relevant volunteers found. Displaying all available volunteers.</p>
        ) : (
          volunteers.length > 0 && <MapComponent volunteers={volunteers} userLocation={userLocation} />
        )}
      </div>

      {/* List of all available volunteers */}
      <div className="available-volunteers">
        <h3>Available Volunteers</h3>
        {availableVolunteers.length > 0 ? (
          <ul>
            {availableVolunteers.map((volunteer) => (
              <li key={volunteer.id}>
                {volunteer.name} - Status: {volunteer.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>No available volunteers found.</p>
        )}
      </div>
    </div>
  );
};

// Map component to display volunteer locations
const MapComponent = ({ volunteers, userLocation }) => {
  useEffect(() => {
    // Initialize the map
    const map = L.map('map').setView([userLocation.latitude, userLocation.longitude], 10);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Add user location marker
    L.marker([userLocation.latitude, userLocation.longitude]).addTo(map)
      .bindPopup('Your Location')
      .openPopup();

    // Add volunteer markers with animated circles
    volunteers.forEach((volunteer) => {
      const marker = L.marker([volunteer.location.latitude, volunteer.location.longitude]).addTo(map);
      marker.bindPopup(`<strong>${volunteer.name}</strong><br/>Status: ${volunteer.status}`);

      // Animated circle (simulate radar pulse)
      const circle = L.circle([volunteer.location.latitude, volunteer.location.longitude], {
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.3,
        radius: 500,
      }).addTo(map);

      // Animation logic (example)
      const interval = setInterval(() => {
        circle.setStyle({ fillOpacity: Math.random() * 0.6 + 0.2 });
      }, 500);

      // Stop the animation after some time
      setTimeout(() => clearInterval(interval), 5000);
    });

    return () => {
      map.remove();
    };
  }, [volunteers, userLocation]);

  return <div id="map" style={{ height: '400px', width: '100%' }} />;
};

export default VolunteerSearch;
