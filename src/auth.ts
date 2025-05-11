import { auth, functions } from './firebase-init.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { httpsCallable, HttpsCallable } from 'firebase/functions';

// View Toggling
const registerSection = document.getElementById(
  'register-section'
) as HTMLElement | null;
const loginSection = document.getElementById(
  'login-section'
) as HTMLElement | null;
const showLoginLink = document.getElementById(
  'showLogin'
) as HTMLAnchorElement | null;
const showRegisterLink = document.getElementById(
  'showRegister'
) as HTMLAnchorElement | null;

// registration form
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

// login form
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

// Google Button
const googleSignInButton = document.getElementById(
  'googleSignInButton'
) as HTMLButtonElement | null;

// Call the profile
interface CreateUserProfileData {
  name?: string;
}
const createUserProfile: HttpsCallable<
  CreateUserProfileData,
  { success: boolean; message: string }
> = httpsCallable(functions, 'createUserProfile');

function showRegisterView() {
  if (registerSection) registerSection.style.display = 'block';
  if (loginSection) loginSection.style.display = 'none';
  if (registerErrorP) registerErrorP.textContent = '';
  if (loginErrorP) loginErrorP.textContent = '';
}

function showLoginView() {
  if (registerSection) registerSection.style.display = 'none';
  if (loginSection) loginSection.style.display = 'block';
  if (registerErrorP) registerErrorP.textContent = '';
  if (loginErrorP) loginErrorP.textContent = '';
}

if (showLoginLink) {
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginView();
  });
} else {
  console.warn('showLoginLink not found');
}

if (showRegisterLink) {
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterView();
  });
}

const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');

if (mode === 'register') {
  showRegisterView();
} else {
  showLoginView();
}

// Registration form submit logic
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
    const name = registerNameInput?.value || '';

    try {
      registerErrorP.textContent = '';
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user && (name || userCredential.user.displayName)) {
        try {
          const profileData: CreateUserProfileData = {
            name: name || userCredential.user.displayName || '',
          };
          const result = await createUserProfile(profileData);
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
} else {
  console.log({
    registerForm,
    registerEmailInput,
    registerPasswordInput,
    registerErrorP,
  });
}

// --- Login Form Submission Logic ---
if (loginForm && loginEmailInput && loginPasswordInput && loginErrorP) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Login form submitted');
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

// Google signin logic
if (googleSignInButton) {
  googleSignInButton.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
      if (loginErrorP) loginErrorP.textContent = '';
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        try {
          const profileData: CreateUserProfileData = {
            name: user.displayName || '',
          };
          await createUserProfile(profileData);
        } catch (profileError) {
          console.error(
            'Error ensuring user profile for Google Sign-In:',
            profileError
          );
        }
      }
      window.location.href = '/profile.html';
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      if (loginErrorP)
        loginErrorP.textContent = error.message || 'Google Sign-In failed.';
    }
  });
}
