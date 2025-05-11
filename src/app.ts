import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

// Nav elements that will be on all pages
const loginLinkNav = document.getElementById('loginLinkNav') as HTMLAnchorElement | null;
const registerLinkNav = document.getElementById('registerLinkNav') as HTMLAnchorElement | null;
const profileLink = document.getElementById('profileLink') as HTMLAnchorElement | null;
const logoutButton = document.getElementById('logoutButton') as HTMLButtonElement | null;

// specific to index.html
const userInfoDiv = document.getElementById('userInfo') as HTMLDivElement | null;
const userEmailSpan = document.getElementById('userEmail') as HTMLSpanElement | null;

// specific to profile.html
const notLoggedInDivProfile = document.getElementById('not-logged-in') as HTMLDivElement | null;
const profileContainerDiv = document.getElementById('profile-container') as HTMLDivElement | null;


onAuthStateChanged(auth, (user: User | null) => {
  if (user) {
    // User is signed in
    if (loginLinkNav) loginLinkNav.style.display = 'none';
    if (registerLinkNav) registerLinkNav.style.display = 'none';
    if (profileLink) profileLink.style.display = 'inline-block';
    if (logoutButton) logoutButton.style.display = 'inline-block';

    if (userInfoDiv) userInfoDiv.style.display = 'block';
    if (userEmailSpan) userEmailSpan.textContent = user.email;

    if (window.location.pathname.includes('profile.html')) {
      if (notLoggedInDivProfile) notLoggedInDivProfile.style.display = 'none';
      if (profileContainerDiv) profileContainerDiv.style.display = 'block';
    }

  } else {
    // User is signed out
    if (loginLinkNav) loginLinkNav.style.display = 'inline-block';
    if (registerLinkNav) registerLinkNav.style.display = 'inline-block';
    if (profileLink) profileLink.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'none';

    if (userInfoDiv) userInfoDiv.style.display = 'none';
    if (userEmailSpan) userEmailSpan.textContent = '';

    // If on profile page and not logged in, show message
    if (window.location.pathname.includes('profile.html')) {
      if (notLoggedInDivProfile) notLoggedInDivProfile.style.display = 'block';
      if (profileContainerDiv) profileContainerDiv.style.display = 'none';
    }
  }
});

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
      if (!window.location.pathname.endsWith('/') && !window.location.pathname.includes('index.html')) {
        window.location.href = '/'; // to home
      } else {
        // Refresh?? Leave empty I guess
      }
    } catch (error) {
      console.error('Sign out error', error);
    }
  });
}