import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, DocumentData } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

initializeApp();
const db = getFirestore();

interface UserProfileData {
    uid: string;
    email?: string | null;
    name?: string;
    bio?: string;
    createdAt: FieldValue;
    updatedAt: FieldValue;
}

interface UserProfileEnsureUpdateData {
    name?: string;
    email?: string;
    updatedAt: FieldValue;
}

interface UserProfileUpdateData {
    name?: string;
    bio?: string;
    updatedAt: FieldValue;
}

export const createUserProfile = onCall(async (request) => {
    logger.info("createUserProfile called with data:", request.data);
    const uid = request.auth?.uid;

    if (!uid) {
        logger.error("Authentication UID is undefined for createUserProfile.");
        throw new HttpsError(
            "unauthenticated",
            "The function must be called while authenticated."
        );
    }

    const { name } = request.data as { name?: string };
    const emailFromToken = request.auth?.token.email;
    const nameFromToken = request.auth?.token.name;
    const userDocRef = db.collection("users").doc(uid!);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
        logger.info(`Creating NEW profile for UID: ${uid}`);
        const newProfileData: UserProfileData = {
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

export const updateUserProfile = onCall(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
        logger.error("Authentication UID is undefined for updateUserProfile.");
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { name, bio } = request.data as { name?: string; bio?: string };
    if (name === undefined && bio === undefined) {
        throw new HttpsError("invalid-argument", "No data provided for update.");
    }

    const dataToUpdate: Partial<UserProfileUpdateData> & { updatedAt: FieldValue } = {
        updatedAt: FieldValue.serverTimestamp(),
    };

    if (name !== undefined) dataToUpdate.name = name;
    if (bio !== undefined) dataToUpdate.bio = bio;

    try {
        await db.collection("users").doc(uid!).update(dataToUpdate);
        logger.info("User profile updated for UID:", uid, dataToUpdate);
        return { success: true, message: "Profile updated successfully." };
    } catch (error) {
        logger.error("Error updating user profile for UID:", uid, error);
        throw new HttpsError("internal", "Failed to update profile.");
    }
});

export const getUserProfile = onCall(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
        logger.error("Authentication UID is undefined for getUserProfile.");
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    try {
        const userDocRef = db.collection("users").doc(uid!);
        const userDocSnap = await userDocRef.get();

        if (!userDocSnap.exists) {
            logger.info(`Profile not found for UID ${uid}, creating basic one.`);
            const basicProfileData: UserProfileData = {
                uid,
                email: request.auth?.token.email,
                name: request.auth?.token.name || "",
                bio: "",
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            };
            await userDocRef.set(basicProfileData);
            logger.info(`Basic profile created for UID: ${uid}`);
            return { profile: basicProfileData };
        }
        logger.info(`Profile retrieved for UID: ${uid}`);
        return { profile: userDocSnap.data() };
    } catch (error) {
        logger.error("Error getting user profile for UID:", uid, error);
        throw new HttpsError("internal", "Failed to get user profile.");
    }
});