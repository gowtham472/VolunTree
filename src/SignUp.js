import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from './firebase'; // Ensure these are correctly imported
import { setDoc, doc } from 'firebase/firestore'; // Import Firestore functions
import './App.css';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [Phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [expertise, setExpertise] = useState('');
  const [skill, setSkill] = useState('');
  const [description, setDescription] = useState('');


  // Get user location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          setError('Unable to retrieve location');
          console.error(error);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setError('Location is required');
      return;
    }
  
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Send verification email
      await sendEmailVerification(user);
      setSuccessMessage('Verification email sent! Please check your inbox.');
  
      // Store user data in Firestore (in login_data collection)
      await setDoc(doc(db, 'login_data', user.uid), {
        name,
        email,
        phone: Phone,
        location,
        availability: true,
        description,
        expertise,
        skill,
        volunteerStatus: "active",
        imageURL: "",
        createdAt: new Date(),
        emailVerified: false,
      });
      
  
      console.log('User registered and verification email sent:', user);
  
    } catch (err) {
      setError(err.message); // Handle errors (e.g., weak password, email already in use)
    }
  };
  

  // Get location on component mount
  React.useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="phone"
          placeholder="phone"
          value={Phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Expertise"
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Skill"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      {location && (
        <p>
          Location: Latitude {location.latitude}, Longitude {location.longitude}
        </p>
      )}
    </div>
  );
};

export default SignUp;
