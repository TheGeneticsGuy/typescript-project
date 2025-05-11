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

// Google Buttons to Register or sign in
const googleSignInButton = document.getElementById(
  'googleSignInButton'
) as HTMLButtonElement | null;
const googleSignUpButton = document.getElementById(
  'googleSignUpButton'
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
          const profileResult = await createUserProfile(profileData);
          console.log('Profile creation result:', profileResult.data.message);
        } catch (profileError) {
          console.error('Error creating user profile document:', profileError);
        }
      }
      window.location.href = '/profile.html';
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        registerErrorP.textContent = error.message;
      } else {
        registerErrorP.textContent =
          'An unknown error occurred during registration.';
      }
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
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        loginErrorP.textContent = error.message;
      } else {
        loginErrorP.textContent =
          'An unknown error occurred during registration.';
      }
    }
  });
}

// Google signin logic - From the official documentation of Firebase
async function handleGoogleAuth() {
  const provider = new GoogleAuthProvider();
  try {
    if (loginErrorP) loginErrorP.textContent = '';
    if (registerErrorP) registerErrorP.textContent = '';

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (user) {
      try {
        const profileData: CreateUserProfileData = {
          name: user.displayName || '',
        };
        await createUserProfile(profileData);
        console.log('Profile ensured for Google user.');
      } catch (profileError) {
        console.error(
          'Error ensuring user profile for Google Auth:',
          profileError
        );
      }
    }
    window.location.href = '/profile.html';
  } catch (error) {
    console.error('Google Auth error:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Google Auth failed due to an unknown error.';
    if (loginSection && loginSection.style.display !== 'none' && loginErrorP) {
      loginErrorP.textContent = errorMessage;
    } else if (
      registerSection &&
      registerSection.style.display !== 'none' &&
      registerErrorP
    ) {
      registerErrorP.textContent = errorMessage;
    } else if (loginErrorP) {
      loginErrorP.textContent = errorMessage;
    }
  }
}

// Attach handler to the Sign IN button
if (googleSignInButton) {
  googleSignInButton.addEventListener('click', handleGoogleAuth);
} else {
  console.warn('googleSignInButton (for login view) not found');
}

// Attach handler to the Sign UP button
if (googleSignUpButton) {
  googleSignUpButton.addEventListener('click', handleGoogleAuth);
} else {
  console.warn('googleSignUpButton (for register view) not found');
}
