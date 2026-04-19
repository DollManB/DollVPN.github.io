import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDh0rL7AjBDqHzt-bFStDLhLaGQiqU0MtU",
  authDomain: "dollvpn.firebaseapp.com",
  projectId: "dollvpn",
  storageBucket: "dollvpn.firebasestorage.app",
  messagingSenderId: "1032300161608",
  appId: "1:1032300161608:web:0f0e34103dd229cf39867d",
  measurementId: "G-9SCMTER9DE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
