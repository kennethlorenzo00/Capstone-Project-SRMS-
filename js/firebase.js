import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js"; 
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7ORNmMl_Cxf21DE081RRLYe9lmi-2p8o",
  authDomain: "srms-be1e2.firebaseapp.com",
  projectId: "srms-be1e2",
  storageBucket: "srms-be1e2.appspot.com",
  messagingSenderId: "150473517778",
  appId: "1:150473517778:web:f0f0ff1be921c38ee55b0b",
  measurementId: "G-410H6KMSZH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app); 
const analytics = getAnalytics(app);  

export { auth, database, firestore }; 
