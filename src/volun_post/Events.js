import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Import the required methods from Firebase
import './Events.css';
import { useNavigate } from 'react-router-dom'; // Correct import for navigation

const Events = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate(); // Initialize the navigate function

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      const eventsRef = collection(db, 'posts'); // Use the collection method from Firebase v9+
      const eventsQuery = query(eventsRef, orderBy('timestamp', 'desc')); // Query with orderBy
      const snapshot = await getDocs(eventsQuery);
      const eventData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(eventData);
    };

    fetchEvents();
  }, []);

  const handleDonate = (upiId) => {
    // Open UPI payment link or QR code modal
    console.log('Donate to:', upiId);
  };

  return (
    <div>
      <div className="events-container">
        <h2>Create Your Post</h2>
        <button onClick={() => navigate('/create-post')}> {/* Use navigate to redirect */}
          Create Post
        </button>
      </div>
      <div className="events-container">
        <h2>Disaster Events</h2>
        {events.length === 0 ? (
          <p>No events posted yet.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.name}</h3>
              <p>{event.description}</p>
              <img src={event.imageURL} alt={event.name} />
              <p>Contact: {event.phoneOrEmail}</p>
              <p>Location: {event.geoTag}</p>
              <button onClick={() => handleDonate(event.upiId)}>Donate</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;
