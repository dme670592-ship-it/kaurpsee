import { NextResponse } from "next/server";
import { getRoomById, saveRoomForUser, unsaveRoomForUser } from "@/lib/mockStore";
import { getCurrentUser } from "@/lib/auth";

function ensureUser() {
  const u = getCurrentUser();
  if (!u) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { user: u };
}

export async function POST(_req, { params }) {
  const { user, error } = ensureUser();
  if (error) return error;
  if (!getRoomById(params.id))
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  saveRoomForUser(user.id, params.id);
  return NextResponse.json({ saved: true });
}

export async function DELETE(_req, { params }) {
  const { user, error } = ensureUser();
  if (error) return error;
  unsaveRoomForUser(user.id, params.id);
  return NextResponse.json({ saved: false });
}
