import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
const authLink = document.getElementById('authLink');
const profileLink = document.getElementById('profileLink');
const logoutButton = document.getElementById('logoutButton');
const userInfoDiv = document.getElementById('userInfo');
const userEmailSpan = document.getElementById('userEmail');
const notLoggedInDivProfile = document.getElementById('not-logged-in');
const profileContainerDiv = document.getElementById('profile-container');
// Styling changes depending on the status.
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Signed in
        if (authLink)
            authLink.style.display = 'none';
        if (profileLink)
            profileLink.style.display = 'inline-block';
        if (logoutButton)
            logoutButton.style.display = 'inline-block';
        if (userInfoDiv)
            userInfoDiv.style.display = 'block';
        if (userEmailSpan)
            userEmailSpan.textContent = user.email;
        // Profile page
        if (window.location.pathname.includes('profile.html')) {
            if (notLoggedInDivProfile)
                notLoggedInDivProfile.style.display = 'none';
            if (profileContainerDiv)
                profileContainerDiv.style.display = 'block';
        }
    }
    else {
        // Signed out
        if (authLink)
            authLink.style.display = 'inline-block';
        if (profileLink)
            profileLink.style.display = 'none';
        if (logoutButton)
            logoutButton.style.display = 'none';
        if (userInfoDiv)
            userInfoDiv.style.display = 'none';
        if (userEmailSpan)
            userEmailSpan.textContent = '';
        // Added this, what if you logout on a 2nd tab, but you are still on profile page?
        // Let's style differently. I might add an option to redirecto back to login if time.
        if (window.location.pathname.includes('profile.html')) {
            if (notLoggedInDivProfile)
                notLoggedInDivProfile.style.display = 'block';
            if (profileContainerDiv)
                profileContainerDiv.style.display = 'none';
        }
    }
});
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        // For stretch, let's add another try/catch
        try {
            await signOut(auth);
            console.log('User signed out');
            // Redirects to home page after logging out.
            if (!window.location.pathname.endsWith('/')) {
                // Avoid redirect loop if already on home
                window.location.href = '/';
            }
        }
        catch (error) {
            console.error('Sign out error', error);
        }
    });
}
