import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpOywqf8XOm6vznT2vvagoqaqWXK1XaAE",
  authDomain: "wpi-tiptopbarbershop.firebaseapp.com",
  projectId: "wpi-tiptopbarbershop",
  storageBucket: "wpi-tiptopbarbershop.firebasestorage.app",
  messagingSenderId: "311490050291",
  appId: "1:311490050291:web:f96881fd0ae280f7381f86",
  measurementId: "G-EHDZLHJKRH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
