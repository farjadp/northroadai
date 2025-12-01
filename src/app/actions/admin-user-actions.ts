"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { UserRole } from "@/lib/user-service";

// --- TYPES ---

export interface AdminUser {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    createdAt: string; // ISO string for client
    lastLogin?: string;
}

export interface CreateUserDTO {
    email: string;
    fullName: string;
    role: UserRole;
}

export interface EditUserDTO {
    uid: string;
    email?: string;
    fullName?: string;
    role?: UserRole;
}

// --- ACTIONS ---

// 1. Get Users (Paginated)
export async function getUsers(
    page: number = 1,
    limit: number = 20,
    roleFilter?: UserRole | "all"
): Promise<{ users: AdminUser[], total: number }> {
    try {
        let query: FirebaseFirestore.Query = adminDb.collection("users");

        if (roleFilter && roleFilter !== "all") {
            query = query.where("role", "==", roleFilter);
        }

        // Get total count (approximation for scalability, or separate counter)
        // For < 1000 users, snapshot.size is fine.
        const snapshot = await query.get();
        const total = snapshot.size;

        // Pagination
        // Note: Offset is expensive in Firestore. Cursor-based is better.
        // For this MVP, we'll use offset but limit it.
        const usersSnap = await query
            .orderBy("createdAt", "desc")
            .offset((page - 1) * limit)
            .limit(limit)
            .get();

        const users: AdminUser[] = usersSnap.docs.map(doc => {
            const data = doc.data();
            return {
                uid: doc.id,
                email: data.email,
                displayName: data.displayName || data.fullName || "Unknown",
                role: data.role || "user",
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
                lastLogin: data.lastLogin?.toDate().toISOString()
            };
        });

        return { users, total };
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
    }
}

// 2. Create User
export async function createUser(data: CreateUserDTO) {
    try {
        // Create in Auth
        const userRecord = await adminAuth.createUser({
            email: data.email,
            displayName: data.fullName,
            emailVerified: true, // Auto-verify since admin created
            password: Math.random().toString(36).slice(-8) + "Aa1!", // Temp random password
        });

        // Set Custom Claims
        await adminAuth.setCustomUserClaims(userRecord.uid, { role: data.role });

        // Create in Firestore
        await adminDb.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: data.email,
            displayName: data.fullName,
            role: data.role,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            metadata: { forceRefresh: true }
        });

        // Send Password Reset Email
        const link = await adminAuth.generatePasswordResetLink(data.email);
        // In a real app, send this via email service (SendGrid/Resend).
        // For now, we'll log it or return it if needed for testing.
        console.log(`[MOCK EMAIL] Password Reset Link for ${data.email}: ${link}`);

        return { success: true, uid: userRecord.uid };
    } catch (error: unknown) {
        console.error("Error creating user:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create user" };
    }
}

// 3. Edit User
export async function editUser(data: EditUserDTO) {
    try {
        const updates: Record<string, unknown> = { updatedAt: Timestamp.now() };
        if (data.email) updates.email = data.email;
        if (data.fullName) updates.displayName = data.fullName;

        // Update Firestore
        await adminDb.collection("users").doc(data.uid).update(updates);

        // Update Auth
        if (data.email || data.fullName) {
            await adminAuth.updateUser(data.uid, {
                email: data.email,
                displayName: data.fullName
            });
        }

        return { success: true };
    } catch (error: unknown) {
        console.error("Error editing user:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to edit user" };
    }
}

// 4. Delete User
export async function deleteUser(uid: string) {
    try {
        await adminAuth.deleteUser(uid);
        await adminDb.collection("users").doc(uid).delete();
        // Cleanup other collections (mentor_profiles, etc.) if needed
        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting user:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete user" };
    }
}

// 5. Set User Role
export async function setUserRole(uid: string, role: UserRole) {
    try {
        // Update Custom Claims
        await adminAuth.setCustomUserClaims(uid, { role });

        // Update Firestore
        await adminDb.collection("users").doc(uid).update({
            role,
            updatedAt: Timestamp.now(),
            "metadata.forceRefresh": true
        });

        return { success: true };
    } catch (error: unknown) {
        console.error("Error setting role:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to set role" };
    }
}
