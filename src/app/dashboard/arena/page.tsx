// ============================================================================ 
// 📁 Hardware Source: src/app/dashboard/arena/page.tsx 
// 🕒 Date: 2025-12-04 
// 🧠 Version: v8.1 (Arena Split: Client Logic + Suspense) 
// ---------------------------------------------------------------------------- 
// ✅ Logic:
// 1. Server shell that lazy-loads the client-heavy Arena UI.
// 2. Suspense boundary around the client chunk to satisfy `useSearchParams`.
// 3. Keeps the previous styling/behavior inside `client.tsx`.
// ============================================================================

"use server";
import { Suspense } from "react";
import ArenaClient from "./client";

export default async function ArenaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-slate-500">Loading Arena...</div>}>
      <ArenaClient />
    </Suspense>
  );
}
