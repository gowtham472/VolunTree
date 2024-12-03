import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Ensure Firebase is properly configured
import { QRCodeSVG } from 'qrcode.react';
import './CreatePost.css';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook

const CreatePost = () => {
  const [postData, setPostData] = useState({
    name: '',
    phoneOrEmail: '',
    upiId: '',
    description: '',
    geoTag: '',
  });
  const [image, setImage] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const navigate = useNavigate(); // Initialize useNavigate

  // Get user's current location (geotag)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setPostData((prevData) => ({
            ...prevData,
            geoTag: `${latitude},${longitude}`,
          }));
        },
        (error) => {
          console.error('Error fetching location:', error);
          alert('Could not fetch location. Please enable location services.');
        }
      );
    }
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData({ ...postData, [name]: value });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle form submission to upload post data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert('Please select an image');
      return;
    }

    try {
      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', 'VolunTree'); // Ensure preset name is correct

      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/ddut1e2yq/image/upload', // Replace with your Cloudinary cloud name
        formData
      );

      const imageURL = response.data.secure_url;

      // Add post data to Firestore
      await addDoc(collection(db, 'posts'), {
        ...postData,
        imageURL,
        timestamp: serverTimestamp(),
      });

      // Generate UPI QR code link
      const upiURL = `upi://pay?pa=${postData.upiId}&pn=${encodeURIComponent(postData.name)}&am=0&cu=INR`;
      setQrCode(upiURL);

      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="create-post-container">
      <h2>Create a Disaster Event Post</h2>
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="back-button">Back</button>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="phoneOrEmail"
          placeholder="Phone or Email"
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="upiId"
          placeholder="UPI ID"
          onChange={handleInputChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          onChange={handleInputChange}
          required
        ></textarea>
        <input
          type="text"
          name="geoTag"
          placeholder="Location (Geotag)"
          value={postData.geoTag}
          readOnly
        />
        <input
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          required
        />
        <button type="submit">Post Event</button>
      </form>

      {qrCode && (
        <div className="qr-container">
          <h3>Donation QR Code</h3>
          <QRCodeSVG value={qrCode} size={200} />
        </div>
      )}
    </div>
  );
};

export default CreatePost;
