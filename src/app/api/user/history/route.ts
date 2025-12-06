
import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import Stripe from "stripe";

async function verifyUser(request: Request, targetUid: string) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("Missing Authorization header");
    }
    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    // Allow if self or admin
    if (decoded.uid !== targetUid) {
        const role = (decoded as any).role || decoded.firebase?.sign_in_attributes?.role;
        if (role !== "admin" && role !== "superadmin") { // simple check
            throw new Error("Access denied");
        }
    }
}

function sanitizeFirestoreObject(value: any): any {
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeFirestoreObject(item));
    }
    if (value && typeof value === "object") {
        if (typeof value.toDate === "function") {
            return value.toDate().toISOString();
        }
        const sanitized: Record<string, any> = {};
        for (const [key, val] of Object.entries(value)) {
            sanitized[key] = sanitizeFirestoreObject(val);
        }
        return sanitized;
    }
    return value;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) return NextResponse.json({ error: "UID required" }, { status: 400 });

    try {
        await verifyUser(request, uid);

        const userDoc = await adminDb.collection("users").doc(uid).get();
        const userData = userDoc.data();

        const sessionsSnap = await adminDb
            .collection("users")
            .doc(uid)
            .collection("sessions")
            .orderBy("updatedAt", "desc")
            .get();

        const sessions = sessionsSnap.docs.map(doc => doc.data());
        const arenaCount = sessions.filter(s => s.type === 'arena').length;
        const chatCount = sessions.filter(s => !s.type || s.type === 'chat').length;

        let xp = 100;
        if (userData?.isPremium) xp += 1000;
        if (userData?.name) xp += 500;
        xp += (arenaCount * 50);
        xp += (chatCount * 10);

        let level = 1;
        let nextLevelXp = 500;
        if (xp > 500) { level = 2; nextLevelXp = 1500; }
        if (xp > 1500) { level = 3; nextLevelXp = 3000; }
        if (xp > 3000) { level = 4; nextLevelXp = 5000; }
        if (xp > 5000) { level = 5; nextLevelXp = 10000; }

        const badges = [];
        if (userData?.isPremium) badges.push("Pro Member");
        if (arenaCount > 0) badges.push("Arena Survivor");
        if (arenaCount > 5) badges.push("Gladiator");
        if (chatCount > 10) badges.push("Curious Mind");

        let invoices: any[] = [];
        if (userData?.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                apiVersion: "2024-11-20.acacia" as any,
                typescript: true,
            });
            const stripeInvoices = await stripe.invoices.list({
                customer: userData.stripeCustomerId,
                limit: 10,
                status: "paid"
            });
            invoices = stripeInvoices.data.map(inv => ({
                id: inv.id,
                date: new Date(inv.created * 1000).toLocaleDateString(),
                amount: (inv.amount_paid / 100).toFixed(2),
                pdf: inv.hosted_invoice_url,
                number: inv.number
            }));
        }

        const recentActivity = sessionsSnap.docs.slice(0, 10).map(doc => ({
            id: doc.id,
            title: doc.data().title || "Untitled Session",
            type: doc.data().type || "chat",
            date: doc.data().updatedAt?.toDate().toLocaleDateString() || "N/A",
        }));

        const sanitizedUserData = sanitizeFirestoreObject(userData);

        return NextResponse.json({
            invoices,
            activities: recentActivity,
            plan: userData?.isPremium ? "Rocket (Pro)" : "Bicycle (Free)",
            isPremium: !!userData?.isPremium,
            gamification: {
                xp,
                level,
                nextLevelXp,
                progress: Math.min(((xp % nextLevelXp) / (nextLevelXp - (nextLevelXp / 2))) * 100, 100),
                badges,
                stats: { arenaCount, chatCount },
                rawData: sanitizedUserData
            }
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
