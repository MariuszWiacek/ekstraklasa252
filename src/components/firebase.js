// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2cF6rVGusj97WXgab0_ZmHYFtvhMBI0g",
  authDomain: "jesien25-cd53b.firebaseapp.com",
  projectId: "jesien25-cd53b",
  databaseURL: "https://jesien25-cd53b-default-rtdb.europe-west1.firebasedatabase.app/",
  storageBucket: "jesien25-cd53b.firebasestorage.app",
  messagingSenderId: "557329099544",
  appId: "1:557329099544:web:f801e81254547845418c6d",
  measurementId: "G-EHS5DBQXJZ"
};

const firebaseConfig2 = {
    apiKey: "AIzaSyAEUAgb7dUt7ZO8S5-B4P3p1fHMJ_LqdPc",
    authDomain: "polskibet-71ef6.firebaseapp.com",
    projectId: "polskibet-71ef6",
    storageBucket: "polskibet-71ef6.appspot.com",
    messagingSenderId: "185818867502",
    appId: "1:185818867502:web:b582993ede95b06f80bcbf",
    measurementId: "G-VRP9QW7LRN"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);