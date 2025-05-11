import { auth, functions } from './firebase-init.js';
import { onAuthStateChanged, User } from 'firebase/auth';
import { httpsCallable, HttpsCallable } from 'firebase/functions';

const profileForm = document.getElementById(
  'profileForm'
) as HTMLFormElement | null;
const profileEmailInput = document.getElementById(
  'profileEmail'
) as HTMLInputElement | null;
const profileNameInput = document.getElementById(
  'profileName'
) as HTMLInputElement | null;
const profileBioTextarea = document.getElementById(
  'profileBio'
) as HTMLTextAreaElement | null;
const profileMessageP = document.getElementById(
  'profileMessage'
) as HTMLParagraphElement | null;
const profileErrorP = document.getElementById(
  'profileError'
) as HTMLParagraphElement | null;
const loadingDiv = document.getElementById(
  'loading-profile'
) as HTMLDivElement | null;

interface UserProfileData {
  uid?: string;
  email?: string | null;
  name?: string;
  bio?: string;
}

// Let's build an interface for each to be efficient with the code
interface GetUserProfileResponse {
  profile: UserProfileData;
}
// This is explicit call from the Firebase official doc
const getUserProfileCallable: HttpsCallable<undefined, GetUserProfileResponse> =
  httpsCallable(functions, 'getUserProfile');

interface UpdateUserProfileData {
  name?: string;
  bio?: string;
}
interface UpdateUserProfileResponse {
  success: boolean;
  message: string;
}
const updateUserProfileCallable: HttpsCallable<
  UpdateUserProfileData,
  UpdateUserProfileResponse
> = httpsCallable(functions, 'updateUserProfile');

async function loadUserProfile(user: User) {
  if (
    !profileEmailInput ||
    !profileNameInput ||
    !profileBioTextarea ||
    !loadingDiv ||
    !profileMessageP ||
    !profileErrorP
  )
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
  } catch (error) {
    console.error("Error fetching user profile:", error);
    if (error instanceof Error) {
      profileErrorP.textContent = error.message;
    } else {
      profileErrorP.textContent = "Could not load profile due to an unknown error.";
    }
  } finally {
    loadingDiv.style.display = 'none';
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, so let's load the profile!
    if (window.location.pathname.includes('profile.html')) {
      loadUserProfile(user);
    }
  } else {
    // Here, the user is NOT signed in, so let's redirect
    if (window.location.pathname.includes('profile.html')) {
      console.log('No user logged in on profile page.');
      if (loadingDiv) loadingDiv.style.display = 'none';
    }
  }
});

if (
  profileForm &&
  profileNameInput &&
  profileBioTextarea &&
  profileMessageP &&
  profileErrorP
) {
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    profileMessageP.textContent = '';
    profileErrorP.textContent = '';

    const currentUser = auth.currentUser;
    if (!currentUser) {
      profileErrorP.textContent =
        'You must be logged in to update your profile.';
      return;
    }

    const name = profileNameInput.value;
    const bio = profileBioTextarea.value;

    try {
      const result = await updateUserProfileCallable({ name, bio });
      console.log('Profile update result:', result.data);
      profileMessageP.textContent =
        result.data.message || 'Profile updated successfully!';
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof Error) {
        profileErrorP.textContent = error.message;
      } else {
        profileErrorP.textContent = "Failed to update Profile.";
      }
    }
  });
}
