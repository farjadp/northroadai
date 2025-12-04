// ============================================================================
// 📁 Hardware Source: src/app/actions/admin-user-actions.ts
// 🧠 Version: v2.0 (Safe Date Handling & Index Warning)
// ============================================================================

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
    createdAt: string; 
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

        // اعمال فیلتر نقش
        if (roleFilter && roleFilter !== "all") {
            query = query.where("role", "==", roleFilter);
        }

        // شمارش کل (برای پیجینیشن)
        const countSnapshot = await query.count().get();
        const total = countSnapshot.data().count;

        // دریافت یوزرها با سورت و پیجینیشن
        // ⚠️ نکته مهم: اگر ارور "The query requires an index" دیدید، لینک داخل ترمینال را کلیک کنید
        const usersSnap = await query
            .orderBy("createdAt", "desc")
            .offset((page - 1) * limit)
            .limit(limit)
            .get();

        const users: AdminUser[] = usersSnap.docs.map(doc => {
            const data = doc.data();
            
            // ✅ هندلینگ امن تاریخ (Safe Date Parsing)
            let createdIso = new Date().toISOString();
            try {
                if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                    createdIso = data.createdAt.toDate().toISOString();
                } else if (data.createdAt && typeof data.createdAt === 'string') {
                    createdIso = data.createdAt; // اگر قبلا string ذخیره شده بود
                }
            } catch (e) {
                console.warn(`Date parse warning for user ${doc.id}`);
            }

            return {
                uid: doc.id,
                email: data.email || "",
                displayName: data.displayName || data.fullName || "Unknown",
                role: (data.role as UserRole) || "user",
                createdAt: createdIso,
                lastLogin: data.lastLogin?.toDate?.()?.toISOString()
            };
        });

        return { users, total };
    } catch (error: any) {
        // 🚨 تشخیص ارور ایندکس فایربیس
        if (error.message && error.message.includes("requires an index")) {
            console.error("🛑 MISSING INDEX ERROR: Please create the index using the link below:");
            console.error(error.message); // لینک ساخت ایندکس اینجا چاپ میشود
            throw new Error("System requires a database index. Check server logs.");
        }
        
        console.error("Error fetching users:", error);
        throw new Error(`Failed to fetch users: ${error.message}`);
    }
}

// 2. Create User
export async function createUser(data: CreateUserDTO) {
    try {
        const userRecord = await adminAuth.createUser({
            email: data.email,
            displayName: data.fullName,
            emailVerified: true,
            password: Math.random().toString(36).slice(-8) + "Aa1!", 
        });

        await adminAuth.setCustomUserClaims(userRecord.uid, { role: data.role });

        // ذخیره در فایراستور با تاریخ استاندارد
        await adminDb.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: data.email,
            displayName: data.fullName,
            role: data.role,
            createdAt: Timestamp.now(), // استفاده از Timestamp فایربیس
            updatedAt: Timestamp.now(),
            metadata: { forceRefresh: true }
        });

        return { success: true, uid: userRecord.uid };
    } catch (error: any) {
        console.error("Error creating user:", error);
        return { success: false, error: error.message };
    }
}

// 3. Edit User
export async function editUser(data: EditUserDTO) {
    try {
        const updates: Record<string, any> = { updatedAt: Timestamp.now() };
        if (data.email) updates.email = data.email;
        if (data.fullName) updates.displayName = data.fullName;

        await adminDb.collection("users").doc(data.uid).update(updates);

        if (data.email || data.fullName) {
            await adminAuth.updateUser(data.uid, {
                email: data.email,
                displayName: data.fullName
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error editing user:", error);
        return { success: false, error: error.message };
    }
}

// 4. Delete User
export async function deleteUser(uid: string) {
    try {
        await adminAuth.deleteUser(uid);
        await adminDb.collection("users").doc(uid).delete();
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 5. Set User Role
export async function setUserRole(uid: string, role: UserRole) {
    try {
        await adminAuth.setCustomUserClaims(uid, { role });
        await adminDb.collection("users").doc(uid).update({
            role,
            updatedAt: Timestamp.now(),
            "metadata.forceRefresh": true
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}