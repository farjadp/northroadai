import { NextResponse } from "next/server";
import { getSystemStatusSnapshot } from "@/lib/system-status";

export const dynamic = "force-dynamic";

export function GET() {
  const snapshot = getSystemStatusSnapshot();
  return NextResponse.json(snapshot);
}
