// TypeScript time!!!
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
// Let's do some stretch work, setup some try/catch
if (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1') {
    const { connectAuthEmulator } = await import('firebase/auth');
    const { connectFirestoreEmulator } = await import('firebase/firestore');
    const { connectFunctionsEmulator } = await import('firebase/functions');
    try {
        // Note, in the Firebase initialization `/firebase init` these ports were the default ports suggested.
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectFunctionsEmulator(functions, 'localhost', 5001);
    }
    catch (error) {
        console.warn('Error connecting to emulators. Already connected?', error);
    }
}
export { app, auth, db, functions };
