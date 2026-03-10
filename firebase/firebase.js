// firebase/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDOhy3s9QGR2WSTh0ghLQ7OXA7Z36rqr-c",
  authDomain: "internsphere-9c869.firebaseapp.com",
  projectId: "internsphere-9c869",
  storageBucket: "internsphere-9c869.firebasestorage.app",
  messagingSenderId: "46919610654",
  appId: "1:46919610654:web:b24a8df1ea62298fa1d90f"
};

const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);