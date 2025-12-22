import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your exact Firebase configuration from Star App project
const firebaseConfig = {
  apiKey: "AIzaSyDfQk5q12hKlX7u1pRjOn0jWLI65VjIjVA",
  authDomain: "star-app-c5473.firebaseapp.com",
  projectId: "star-app-c5473",
  storageBucket: "star-app-c5473.firebasestorage.app",
  messagingSenderId: "847763603744",
  appId: "1:847763603744:web:28c9871aba883214e15745",
  measurementId: "G-TRPJF7MJDC"
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
