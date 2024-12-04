/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
// Import Firebase scripts for service workers
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkD-tmZNQKwtvk0mSF0qY3Y96ph4_AMjQ",
  authDomain: "voluntree-3eab8.firebaseapp.com",
  projectId: "voluntree-3eab8",
  storageBucket: "voluntree-3eab8.appspot.com",
  messagingSenderId: "414645145989",
  appId: "1:414645145989:web:cad0e6b79b44d2a29534ec",
  measurementId: "G-53FRTN4T8Q",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});
