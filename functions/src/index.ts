// functions/src/index.ts
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, DocumentData } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

initializeApp();
const db = getFirestore();

interface UserProfileEnsureUpdateData {
    name?: string;
    email?: string;
    updatedAt: FieldValue;
}

export const createUserProfile = onCall(async (request) => {
    logger.info("createUserProfile called with data:", request.data);
    const uid = request.auth?.uid;

    if (!uid) {
        logger.error("Authentication UID is undefined.");
        throw new HttpsError(
            "unauthenticated",
            "The function must be called while authenticated.",
        );
    }

    const { name } = request.data as { name?: string };
    const emailFromToken = request.auth?.token.email;
    const nameFromToken = request.auth?.token.name;

    const userDocRef = db.collection("users").doc(uid!); // Safe due to guard above
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
        // Document does NOT exist - this is a true new user registration
        logger.info(`Creating NEW profile for UID: ${uid}`);
        const newProfileData = {
            uid,
            email: emailFromToken,
            name: name || nameFromToken || "",
            bio: "",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };
        await userDocRef.set(newProfileData);
        return { success: true, message: "User profile created successfully." };
    } else {
        // Document DOES exist - this is an update/ensure scenario
        logger.info(`Updating existing profile for UID: ${uid} (ensure call)`);
        const existingProfileData: DocumentData | undefined = userDocSnap.data();

        const dataToUpdate: Partial<UserProfileEnsureUpdateData> & { updatedAt: FieldValue } = {
            updatedAt: FieldValue.serverTimestamp(),
        };

        if (name !== undefined) {
            dataToUpdate.name = name;
        } else if (existingProfileData && !existingProfileData.name && nameFromToken) {
            dataToUpdate.name = nameFromToken;
        }

        if (emailFromToken && existingProfileData && (!existingProfileData.email || existingProfileData.email !== emailFromToken)) {
            dataToUpdate.email = emailFromToken;
        }

        if (Object.keys(dataToUpdate).length > 1) {
            logger.info(`Updating profile for ${uid} with:`, dataToUpdate);
            await userDocRef.update(dataToUpdate);
        } else {
            logger.info(`No substantial profile fields to update for UID: ${uid}, only timestamp would change.`);
        }
        return { success: true, message: "User profile ensured/updated." };
    }
});

interface UserProfileUpdateDataForExternal {
    name?: string;
    bio?: string;
    updatedAt: FieldValue;
}

export const updateUserProfile = onCall(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { name, bio } = request.data as { name?: string, bio?: string };
    if (name === undefined && bio === undefined) {
        throw new HttpsError("invalid-argument", "No data provided for update.");
    }

    const dataToUpdate: Partial<UserProfileUpdateDataForExternal> & { updatedAt: FieldValue } = {
        updatedAt: FieldValue.serverTimestamp(),
    };

    if (name !== undefined) dataToUpdate.name = name;
    if (bio !== undefined) dataToUpdate.bio = bio;

    try {
        await db.collection("users").doc(uid!).update(dataToUpdate);
        logger.info("User profile updated:", uid, dataToUpdate);
        return { success: true, message: "Profile updated successfully." };
    } catch (error) {
        logger.error("Error updating user profile:", uid, error);
        throw new HttpsError("internal", "Failed to update profile.");
    }
});