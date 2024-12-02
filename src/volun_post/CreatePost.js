import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import './CreatePost.css';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Correct imports for storage
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'; // Correct imports for Firestore

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

  // Get user's current location (geotag)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setPostData((prevData) => ({
          ...prevData,
          geoTag: `${latitude},${longitude}`, // Store geotag as a string of lat, long
        }));
      });
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
    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `posts/${image.name}`);
      await uploadBytes(imageRef, image);
      const imageURL = await getDownloadURL(imageRef);

      // Add post data to Firestore
      await addDoc(collection(db, 'posts'), {
        ...postData,
        imageURL,
        timestamp: serverTimestamp(),
      });

      // Generate QR code for donation
      setQrCode(postData.upiId); 
      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="create-post-container">
      <h2>Create a Disaster Event Post</h2>
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
          value={postData.geoTag} // Automatically filled with geotag
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
          <QRCodeSVG value={qrCode} />
        </div>
      )}
    </div>
  );
};

export default CreatePost;
