import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import './Events.css';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const navigate = useNavigate();

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, 'posts');
        const eventsQuery = query(eventsRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(eventsQuery);
        const eventData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // Handle Donate button click
  const handleDonate = (upiId) => {
    setUpiId(upiId);
    setShowQRCodeModal(true);
  };

  const closeQRCodeModal = () => {
    setShowQRCodeModal(false);
  };

  return (
    <div className="events-container">
      <h2>Disaster Events</h2>
      <button onClick={() => navigate('/create-post')}>Create Post</button>
      <button onClick={() => navigate(-1)}>Back</button>
      {events.length === 0 ? (
        <p>No events posted yet.</p>
      ) : (
        events.map((event) => (
          <div key={event.id} className="event-card">
            <h3>{event.name}</h3>
            <p>{event.description}</p>
            {event.imageURL && <img src={event.imageURL} alt={event.name} />}
            <p>Contact: {event.phoneOrEmail}</p>
            <p>Location: {event.geoTag}</p>
            <button onClick={() => handleDonate(event.upiId)}>Donate</button>
          </div>
        ))
      )}

      {/* QR Code Modal */}
      {showQRCodeModal && (
        <div className="qr-modal">
          <div className="qr-modal-content">
            <h3>Donate via GPay</h3>
            <QRCodeSVG value={`upi://pay?pa=${upiId}&pn=Donor&am=0&cu=INR`} size={200} />
            <button onClick={closeQRCodeModal}>Close</button>
            <button onClick={() => navigate('/submit-payment', { state: { upiId } })}>Payment Done? Submit Transaction</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
