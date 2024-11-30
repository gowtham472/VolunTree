import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase'; // Firebase configuration
import './VolunteerSearch.css'; // Custom styles
import L from 'leaflet'; // Leaflet for mapping
import 'leaflet/dist/leaflet.css';
import OpenVINOAI from './openvino'; // Placeholder for OpenVINO integration
import { useNavigate } from 'react-router-dom';

const VolunteerSearch = () => {
  const navigate = useNavigate();
  const [disasterTitle, setDisasterTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [volunteers, setVolunteers] = useState([]);
  const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch user's current location on component load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => setError(`Location error: ${error.message}`)
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const volunteerRef = query(collection(db, 'login_data'), where('status', '==', 'volunteer'));
      const volunteerSnapshot = await getDocs(volunteerRef);
      const fetchedVolunteers = [];

      volunteerSnapshot.forEach((doc) => {
        const data = doc.data();
        const volunteerLocation = data.location;
        // Use OpenVINO AI or any filtering logic based on description
        const processedData = OpenVINOAI.filterVolunteer(data, description); // Replace with actual OpenVINO logic
        if (processedData && volunteerLocation) {
          fetchedVolunteers.push({ ...data, id: doc.id });
        }
      });

      setVolunteers(fetchedVolunteers);
    } catch (err) {
      setError('Error fetching volunteers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Map Section: Render Map with Volunteers or Only User Location
  const MapComponent = ({ volunteers, userLocation }) => {
    useEffect(() => {
      const mapContainer = document.getElementById('map');
      if (mapContainer._leaflet_id) return; // Avoid reinitialization

      const map = L.map('map').setView([userLocation.latitude, userLocation.longitude], 10);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Add user location marker
      L.marker([userLocation.latitude, userLocation.longitude]).addTo(map)
        .bindPopup('Your Location')
        .openPopup();

      // Add volunteer markers with yellow pins
      volunteers.forEach((volunteer) => {
        const yellowIcon = new L.Icon({
          iconUrl: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const marker = L.marker([volunteer.location.latitude, volunteer.location.longitude], {
          icon: yellowIcon,
        }).addTo(map);

        // Show volunteer details on hover
        marker.bindPopup(`
          <div>
            <img src="${volunteer.imageURL}" alt="${volunteer.name}" style="width:50px;height:50px;border-radius:50%;" />
            <p><strong>${volunteer.name}</strong></p>
            <p>Phone: ${volunteer.phone}</p>
          </div>
        `);
      });
    }, [volunteers, userLocation]);

    return <div id="map" className="map"></div>;
  };

  return (
    <div className="volunteer-search-page">
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
          <input
            type="text"
            placeholder="Location (Address)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search Volunteers'}
          </button>
          <button type="button" onClick={() => navigate(-1)}>Back</button>
        </form>

        {/* Map Section */}
        <div id="map">
          {loading ? (
            <p>Loading map...</p>
          ) : (
            <MapComponent volunteers={volunteers} userLocation={userLocation} />
          )}
        </div>

        {/* No volunteers found message */}
        {volunteers.length === 0 && !loading && (
          <p>No volunteers found. Showing your location on the map.</p>
        )}
      </div>
    </div>
  );
};

export default VolunteerSearch;
