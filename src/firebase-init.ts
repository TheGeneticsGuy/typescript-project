// TypeScript time!!!

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';

// My specific configuration from the Firebase web app
// Copied directly from my project's Firebase SDK (web app)
const firebaseConfig = {
  apiKey: 'AIzaSyA1QtyB-y-J-Lx-LgFUdl-GVN5XV4A9ZJk',
  authDomain: 'cse340-ts-project.firebaseapp.com',
  projectId: 'cse340-ts-project',
  storageBucket: 'cse340-ts-project.firebasestorage.app',
  messagingSenderId: '523688275126',
  appId: '1:523688275126:web:1ae26ec95b7b272f4f0a17',
  measurementId: 'G-L7PWYF20ZW',
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const functionsInstance: Functions = getFunctions(app);

// Let's do some stretch work, setup some try/catch
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
) {
  console.log('Connecting to Firebase Emulators (IIFE approach)');
  (async () => {
    try {
      const { connectAuthEmulator } = await import('firebase/auth');
      const { connectFirestoreEmulator } = await import('firebase/firestore');
      const { connectFunctionsEmulator } = await import('firebase/functions');

      // Please note - all of these ports were part of the default Firebase suggested on the firebase init
      connectAuthEmulator(auth, 'http://localhost:9099');
      console.log('Auth emulator connected or connection attempt made.');

      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Firestore emulator connected or connection attempt made.');

      connectFunctionsEmulator(functionsInstance, 'localhost', 5001); // Use renamed variable
      console.log('Functions emulator connected or connection attempt made.');
    } catch (error) {
      console.warn('Error during emulator connection setup:', error);
    }
  })();
}

export { app, auth, db, functionsInstance as functions };
