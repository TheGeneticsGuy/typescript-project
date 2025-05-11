import { auth, functions } from './firebase-init.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { httpsCallable, HttpsCallable } from 'firebase/functions';

// Registration
const registerForm = document.getElementById(
  'registerForm'
) as HTMLFormElement | null;
const registerEmailInput = document.getElementById(
  'registerEmail'
) as HTMLInputElement | null;
const registerPasswordInput = document.getElementById(
  'registerPassword'
) as HTMLInputElement | null;
const registerNameInput = document.getElementById(
  'registerName'
) as HTMLInputElement | null;
const registerErrorP = document.getElementById(
  'registerError'
) as HTMLParagraphElement | null;

interface CreateUserProfileData {
  name?: string;
  // Maybe I'll add another initial if I expand this
}
// Define type
const createUserProfile: HttpsCallable<
  CreateUserProfileData,
  { success: boolean; message: string }
> = httpsCallable(functions, 'createUserProfile');

// Only allow submit of all
if (
  registerForm &&
  registerEmailInput &&
  registerPasswordInput &&
  registerErrorP
) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;
    const name = registerNameInput?.value || ''; // I can add an optional name here

    try {
      registerErrorP.textContent = '';
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered:', userCredential.user);

      // This part is direct from the Firebase official documentation on what to do.
      // If successful Firebase registration
      if (userCredential.user && name) {
        try {
          const profileData: CreateUserProfileData = { name };
          const result = await createUserProfile(profileData);
          console.log('Profile creation result:', result.data);
        } catch (profileError) {
          console.error('Error creating user profile document:', profileError);
        }
      }

      window.location.href = '/profile.html';
    } catch (error: any) {
      console.error('Registration error:', error);
      registerErrorP.textContent = error.message || 'Failed to register.';
    }
  });
}

// Login
const loginForm = document.getElementById(
  'loginForm'
) as HTMLFormElement | null;
const loginEmailInput = document.getElementById(
  'loginEmail'
) as HTMLInputElement | null;
const loginPasswordInput = document.getElementById(
  'loginPassword'
) as HTMLInputElement | null;
const loginErrorP = document.getElementById(
  'loginError'
) as HTMLParagraphElement | null;

if (loginForm && loginEmailInput && loginPasswordInput && loginErrorP) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    try {
      loginErrorP.textContent = '';
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log('User logged in:', userCredential.user);
      window.location.href = '/profile.html';
    } catch (error: any) {
      console.error('Login error:', error);
      loginErrorP.textContent = error.message || 'Failed to login.';
    }
  });
}

// Google Sign-In
const googleSignInButton = document.getElementById(
  'googleSignInButton'
) as HTMLButtonElement | null;
if (googleSignInButton) {
  googleSignInButton.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
      if (loginErrorP) loginErrorP.textContent = ''; // Clear previous errors
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google Sign-In success:', user);
      window.location.href = '/profile.html';
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      if (loginErrorP)
        loginErrorP.textContent = error.message || 'Google Sign-In failed.';
    }
  });
}
