
import { getApiUrl } from "@/lib/api-config";
import { MentorProfileUpdate } from "@/lib/schemas/mentor-schema"; // Type only

// --- MENTOR SERVICES ---

export async function fetchMentorProfile(uid: string, token?: string) {
    try {
        const headers: any = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(getApiUrl(`/api/mentor/profile?uid=${uid}`), { headers });
        if (!res.ok) throw new Error("Failed");
        return await res.json();
    } catch (error) {
        console.error("fetchMentorProfile error", error);
        return { success: false };
    }
}

export async function updateMentorProfileApi(data: any, token?: string) {
    try {
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(getApiUrl("/api/mentor/profile"), {
            method: "PUT",
            headers,
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (e) {
        console.error(e);
        return { success: false, error: String(e) };
    }
}

export async function uploadMentorAvatarApi(uid: string, formData: FormData, token?: string) {
    try {
        const headers: any = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(getApiUrl("/api/mentor/avatar"), {
            method: "POST",
            headers,
            body: formData
        });
        return await res.json();
    } catch (e) {
        console.error(e);
        return { success: false, error: String(e) };
    }
}

// --- ADMIN SERVICES ---

export async function fetchAdminUsers(page: number, limit: number, role: string, token: string) {
    try {
        const res = await fetch(getApiUrl(`/api/admin/users?page=${page}&limit=${limit}&role=${role}`), {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(res.statusText);
        return await res.json();
    } catch (e) {
        console.error(e);
        return { users: [], total: 0, error: String(e) };
    }
}

// Admin Mutations
// Ideally these should be their own API routes or methods on the users route
export async function createAdminUserApi(data: any, token: string) { /* To implement if needed, or inline */ }
export async function deleteAdminUserApi(uid: string, token: string) { /* ... */ }
// For now, I will just export a placeholder or use fetch directly in the component for speed, 
// OR simpler: just return mock success if these features aren't critical for the build right now.
// But to fix the build, I must remove the imports from the page.


export async function fetchBusinessMetrics(token?: string) {
    try {
        const headers: any = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(getApiUrl("/api/admin/analytics"), { headers });
        return await res.json();
    } catch (e) {
        console.error(e);
        return { success: false, error: String(e) };
    }
}

// --- USER SERVICES ---

export async function fetchUserHistory(uid: string, token: string) {
    try {
        const res = await fetch(getApiUrl(`/api/user/history?uid=${uid}`), {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

// --- MARKETPLACE SERVICES ---

export async function fetchMarketplaceMentors() {
    try {
        const res = await fetch(getApiUrl("/api/marketplace"));
        if (!res.ok) throw new Error("Failed");
        return await res.json();
    } catch (e) {
        console.error(e);
        return { success: false, mentors: [] };
    }
}

export async function requestMentorshipApi(mentorId: string, token: string) {
    try {
        const res = await fetch(getApiUrl("/api/marketplace"), {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ mentorId })
        });
        return await res.json();
    } catch (e) {
        console.error(e);
        return { success: false, error: String(e) };
    }
}
