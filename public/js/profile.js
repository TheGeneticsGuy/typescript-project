import { auth, functions } from './firebase-init.js';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from "firebase/functions";
const profileForm = document.getElementById('profileForm');
const profileEmailInput = document.getElementById('profileEmail');
const profileNameInput = document.getElementById('profileName');
const profileBioTextarea = document.getElementById('profileBio');
const profileMessageP = document.getElementById('profileMessage');
const profileErrorP = document.getElementById('profileError');
const loadingDiv = document.getElementById('loading-profile');
// This is explicit call from the Firebase official doc
const getUserProfileCallable = httpsCallable(functions, 'getUserProfile');
const updateUserProfileCallable = httpsCallable(functions, 'updateUserProfile');
async function loadUserProfile(user) {
    if (!profileEmailInput || !profileNameInput || !profileBioTextarea || !loadingDiv || !profileMessageP || !profileErrorP)
        return;
    loadingDiv.style.display = 'block';
    profileMessageP.textContent = '';
    profileErrorP.textContent = '';
    try {
        const result = await getUserProfileCallable();
        const profile = result.data.profile;
        profileEmailInput.value = user.email || profile.email || '';
        profileNameInput.value = profile.name || '';
        profileBioTextarea.value = profile.bio || '';
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        profileErrorP.textContent = error.message || "Could not load profile.";
    }
    finally {
        loadingDiv.style.display = 'none';
    }
}
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, so let's load the profile!
        if (window.location.pathname.includes('profile.html')) {
            loadUserProfile(user);
        }
    }
    else {
        // Here, the user is NOT signed in, so let's redirect
        if (window.location.pathname.includes('profile.html')) {
            console.log("No user logged in on profile page.");
            if (loadingDiv)
                loadingDiv.style.display = 'none';
        }
    }
});
if (profileForm && profileNameInput && profileBioTextarea && profileMessageP && profileErrorP) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        profileMessageP.textContent = '';
        profileErrorP.textContent = '';
        const currentUser = auth.currentUser;
        if (!currentUser) {
            profileErrorP.textContent = "You must be logged in to update your profile.";
            return;
        }
        const name = profileNameInput.value;
        const bio = profileBioTextarea.value;
        try {
            const result = await updateUserProfileCallable({ name, bio });
            console.log("Profile update result:", result.data);
            profileMessageP.textContent = result.data.message || "Profile updated successfully!";
        }
        catch (error) {
            console.error("Error updating profile:", error);
            profileErrorP.textContent = error.message || "Failed to update profile.";
        }
    });
}
