import { NextResponse } from "next/server";
import { similarRooms } from "@/lib/mockStore";

export async function GET(_req, { params }) {
  return NextResponse.json({ rooms: similarRooms(params.id) });
}
