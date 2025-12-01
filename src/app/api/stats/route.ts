// src/app/api/stats/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // اگر ادمین دیتابیس وصل نبود، دیتای خالی بفرست تا سایت کرش نکند
    if (!adminDb) {
      return NextResponse.json({ 
        users: 0, 
        chats: 0, 
        knowledge: 0 
      });
    }

    // گرفتن تعداد حدودی داکیومنت‌ها (Count Queries)
    // نکته: این روش بهینه است و هزینه کمی دارد
    const usersCount = (await adminDb.collection("users").count().get()).data().count;
    const chatsCount = (await adminDb.collection("guest_chats").count().get()).data().count;
    const knowledgeCount = (await adminDb.collection("knowledge_base").count().get()).data().count;

    return NextResponse.json({
      users: usersCount,
      chats: chatsCount,
      knowledge: knowledgeCount
    });

  } catch (error: any) {
    console.error("Stats API Error:", error);
    // در صورت ارور، دیتای صفر برمی‌گردانیم تا صفحه سفید نشود
    return NextResponse.json({ users: 0, chats: 0, knowledge: 0 });
  }
}