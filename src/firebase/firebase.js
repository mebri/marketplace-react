import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlngqrECdzuRMNq9TRGKXrmF2UYw2IFkA",
  authDomain: "yeegna-gebeya.firebaseapp.com",
  projectId: "yeegna-gebeya",
  storageBucket: "yeegna-gebeya.firebasestorage.app",
  messagingSenderId: "577516312162",
  appId: "1:577516312162:web:902c7ff748e9cd1a22233b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;