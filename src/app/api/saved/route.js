import { NextResponse } from "next/server";
import { getSavedIds } from "@/lib/mockStore";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ savedIds: [], count: 0 });
  const savedIds = getSavedIds(user.id);
  return NextResponse.json({ savedIds, count: savedIds.length });
}
