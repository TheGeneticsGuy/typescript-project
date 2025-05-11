// Backend logic for profile creation and updates, connected with Firebase

import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

// IMPORTANT!!!
// 'onCall' are recommended (according to Firebase official documentation) for client-to-function comms. They auto handle CORS,
// deserialize the request, and authenticate the user. onRequest are the more general purpose HTTP endpoints
// where you still need to handle CORS, parsing, and auth manually, so using onCall here.

// Initialize Firebase Admin SDK ONLY ONCE - I made the mistake of initializing over and over...
initializeApp();
const db = getFirestore();

// I need to define a type to avoid using "ANY"
interface UserProfileUpdateData {
    name?: string;
    bio?: string;
    updatedAt: FieldValue;
}

/**
 * Creates a user profile document in Firestore and triggers after client calls function
 */
export const createUserProfile = onCall(async (request) => {
    logger.info("createUserProfile called with data:", request.data);
    const uid = request.auth?.uid;

    // Error checks suggested by Firebase official documentation
    if (!uid) {
        logger.error("Authentication UID is undefined.");
        throw new HttpsError(
            "unauthenticated",
            "The function must be called while authenticated.",
        );
    }

    const { name, /* I'll revisit this... */ } = request.data;

    try {
        const userProfile = {
            uid, // Note doc ID is the UID
            email: request.auth?.token.email, // You can pull the email from the auth token
            name: name || request.auth?.token.name || "",
            bio: "",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        await db.collection("users").doc(uid).set(userProfile, { merge: true });
        logger.info(`User profile created and updated for UID: ${uid}`);
        return { success: true, message: "User profile created successfully." };
    } catch (error) {
        logger.error("Error creating user profile:", error);
        throw new HttpsError(
            "internal",
            "Failed to create user profile.",
            error,
        );
    }
});


/**
 * Gets the profile from Firestore.
 */
export const getUserProfile = onCall(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    try {
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            // Let's set a generic profile if it doesn't exist
            // I found this can happen if a user signed up with Google but the createUserProfile wasn't
            // explicityly called...
            logger.info(`Profile not found for ${uid}, creating generic, basic one.`);
            const basicProfile = {
                uid,
                email: request.auth?.token.email,
                name: request.auth?.token.name || "",
                bio: "",
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            };
            await db.collection("users").doc(uid).set(basicProfile);
            logger.info(`General profile created for UID: ${uid}`);
            return { profile: basicProfile };
        }
        return { profile: userDoc.data() };
    } catch (error) {
        logger.error("Error getting user profile:", uid, error);
        throw new HttpsError("internal", "Failed to get user profile.");
    }
});

/**
 * Updates the user's profile in the Firestore cloud.
 */
export const updateUserProfile = onCall(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { name, bio } = request.data;
    if (name === undefined && bio === undefined) {
        throw new HttpsError("invalid-argument", "No data provided for update.");
    }

    const dataToUpdate: Partial<UserProfileUpdateData> & { updatedAt: FieldValue } = {
        updatedAt: FieldValue.serverTimestamp(),
    };
    if (name !== undefined) dataToUpdate.name = name;
    if (bio !== undefined) dataToUpdate.bio = bio;

    try {
        await db.collection("users").doc(uid).update(dataToUpdate);
        logger.info("User profile updated:", uid, dataToUpdate);
        return { success: true, message: "Profile updated successfully." };
    } catch (error) {
        logger.error("Error updating user profile:", uid, error);
        throw new HttpsError("internal", "Failed to update profile.");
    }
});