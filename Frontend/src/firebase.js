import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";

// Hardcoded config for development - REMOVE IN PRODUCTION
const firebaseConfig = {
  apiKey: "AIzaSyDb8Pgy3ZRPExd2KEoooZ6udP1I1ACjiyo",
  authDomain: "betterhood-6969.firebaseapp.com",
  projectId: "betterhood-6969",
  storageBucket: "betterhood-6969.appspot.com",
  messagingSenderId: "898471309292",
  appId: "1:898471309292:web:3cf57fdd63c33e376b5ac9"
};

// Debug configuration values
console.log('Firebase Config Status:', {
  apiKey: firebaseConfig.apiKey?.substring(0, 5) + '...',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  configComplete: !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  )
});

let auth;

// Initialize Firebase
try {
  console.log('Initializing Firebase...');
  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase API Key is missing');
  }
  const app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');

  // Initialize Authentication
  auth = getAuth(app);
  auth.useDeviceLanguage(); // Set language to device default

  // Configure auth persistence
  setPersistence(auth, browserLocalPersistence)
    .catch(error => {
      console.error('Error setting persistence:', error);
    });

  // Log initialization status
  console.log('Firebase services initialized:', {
    authInitialized: !!auth,
    config: {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    }
  });
} catch (error) {
  console.error('Firebase initialization error:', {
    code: error.code,
    message: error.message,
    stack: error.stack,
    config: {
      apiKeyPresent: !!firebaseConfig.apiKey,
      authDomainPresent: !!firebaseConfig.authDomain,
      projectIdPresent: !!firebaseConfig.projectId
    }
  });
  throw error;
}

export { auth };
