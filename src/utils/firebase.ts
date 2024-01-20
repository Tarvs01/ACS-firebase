// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDykDcf1HS86O4YKhwVYx-aHmP14viyWo",
  authDomain: "acs-final-year.firebaseapp.com",
  projectId: "acs-final-year",
  storageBucket: "acs-final-year.appspot.com",
  messagingSenderId: "1055311907534",
  appId: "1:1055311907534:web:f8e509bdb84bd6343c1e9f",
  measurementId: "G-EYRPBHMS5S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
//const analytics = getAnalytics(app);

export {db, auth};