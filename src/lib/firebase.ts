import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA64xmiWMfP2eMEI_tjt56P6pczNWvMDFE",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skillsbridge-4bdee.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skillsbridge-4bdee",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skillsbridge-4bdee.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "108031389441",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || "1:108031389441:web:3a161a865c4896d351f500",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GTSZWE6PYX",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
