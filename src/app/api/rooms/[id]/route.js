import { NextResponse } from "next/server";
import { getRoomById, updateRoom, deleteRoom } from "@/lib/mockStore";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req, { params }) {
  const room = getRoomById(params.id);
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ room });
}

export async function PUT(req, { params }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const room = getRoomById(params.id);
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(room.owner) !== String(user.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updated = updateRoom(params.id, body);
  return NextResponse.json({ room: updated });
}

export async function DELETE(_req, { params }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const room = getRoomById(params.id);
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(room.owner) !== String(user.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  deleteRoom(params.id);
  return NextResponse.json({ ok: true });
}
