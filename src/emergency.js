// Emergency.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Import your Firebase database setup
import { collection, addDoc } from 'firebase/firestore'; // For Firestore data storage
import './emergency.css';

const Emergency = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // Automatically detect location using Geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude}, ${longitude}`);
        },
        (error) => {
          console.error('Error fetching location:', error);
          setLocation('Location access denied');
        }
      );
    } else {
      setLocation('Geolocation not supported');
    }
  }, []);

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'emergencies'), {
        title,
        description,
        location,
        timestamp: new Date(),
      });
      alert('Emergency reported successfully!');
    } catch (error) {
      console.error('Error reporting emergency:', error);
      alert('Failed to report emergency.');
    }
  };

  return (
    <div className="emergency-container">
      <h2>Emergency Report</h2>
      <form onSubmit={handleEmergencySubmit}>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Title of Disaster or Problem" 
          required 
        />
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Description" 
          required 
        />
        <input 
          type="text" 
          value={location} 
          placeholder="Location" 
          readOnly 
        />
        <button type="submit">Submit Emergency</button>
        <button type="button" onClick={() => window.history.back()}>Back</button>
      </form>
    </div>
  );
};

export default Emergency;
