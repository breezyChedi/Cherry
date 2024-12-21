// app/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig={
  apiKey: "AIzaSyAPEf_LA8qo4mYrEpYsotw-hKDFVHOAJYQ",
  authDomain: "cherry-2a2de.firebaseapp.com",
  projectId: "cherry-2a2de",
  storageBucket: "cherry-2a2de.firebasestorage.app",
  messagingSenderId: "592565238356",
  appId: "1:592565238356:web:3e1f61aa3a720a1beb8bc1",
  measurementId: "G-E3TKZS7XSF"

}
//test
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
