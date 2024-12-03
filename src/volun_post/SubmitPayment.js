import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import './SubmitPayment.css';

const SubmitPayment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScreenshotChange = (e) => {
    setScreenshot(e.target.files[0]);
  };

  // Upload screenshot to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Payment');  // Use your Cloudinary preset name
    formData.append('cloud_name', 'ddut1e2yq');  // Replace with your Cloudinary cloud name
  
    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/ddut1e2yq/image/upload',
        formData
      );
      return response.data.secure_url;  // Return the URL of the uploaded image
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!transactionId || !screenshot) {
      alert('Please provide transaction ID and screenshot.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload the screenshot to Cloudinary
      const screenshotUrl = await uploadToCloudinary(screenshot);
      if (!screenshotUrl) {
        alert('Failed to upload screenshot. Please try again.');
        setLoading(false);
        return;
      }

      // Step 2: Store transaction details in Firestore
      const paymentData = {
        transactionId,
        screenshotUrl,
        upiId: state.upiId,  // The UPI ID from the previous page (Events page)
        timestamp: new Date(),
      };

      await addDoc(collection(db, 'payments'), paymentData);

      setIsSubmitted(true);
      setTimeout(() => {
        navigate('/events'); // Redirect to the Events page after successful submission
      }, 2000); // Redirect after 2 seconds to show success message
    } catch (error) {
      console.error('Error saving payment details:', error);
      alert('There was an error submitting your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-payment-container">
      <h2>Submit Payment Details</h2>

      {isSubmitted ? (
        <div className="success-message">
          <p>Payment submitted successfully!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Transaction ID</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Payment Screenshot</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SubmitPayment;
