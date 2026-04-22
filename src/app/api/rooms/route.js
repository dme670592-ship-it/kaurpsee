import { NextResponse } from "next/server";
import { paginateRooms, listRooms, createRoom } from "@/lib/mockStore";
import { getCurrentUser } from "@/lib/auth";

const PAGE_SIZE = 12;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const filter = {};
  const locality = searchParams.get("locality");
  const roomType = searchParams.get("roomType");
  const gender = searchParams.get("gender");
  const minPrice = parseInt(searchParams.get("minPrice") || "0", 10);
  const maxPrice = parseInt(searchParams.get("maxPrice") || "0", 10);
  const search = searchParams.get("q");
  const mine = searchParams.get("mine");
  const cursor = searchParams.get("cursor");
  const limitParam = parseInt(searchParams.get("limit") || `${PAGE_SIZE}`, 10);
  const limit = Math.min(Math.max(limitParam, 1), 50);

  if (locality) filter.locality = locality;
  if (roomType) filter.roomType = roomType;
  if (gender) filter.gender = gender;
  if (minPrice) filter.minPrice = minPrice;
  if (maxPrice) filter.maxPrice = maxPrice;
  if (search) filter.search = search;

  if (mine === "1") {
    const user = getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    filter.owner = user.id;
    return NextResponse.json({ rooms: listRooms(filter) });
  }

  filter.available = true;
  const { rooms, nextCursor } = paginateRooms(filter, { cursor, limit });
  return NextResponse.json({ rooms, nextCursor });
}

export async function POST(req) {
  try {
    const user = getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "owner") return NextResponse.json({ error: "Only owners can list rooms" }, { status: 403 });

    const body = await req.json();
    const required = ["title", "description", "price", "roomType", "locality", "ownerName", "ownerPhone"];
    for (const k of required) if (!body[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 });

    const room = createRoom({
      title: body.title,
      description: body.description,
      price: Number(body.price),
      roomType: body.roomType,
      locality: body.locality,
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      gender: body.gender || "Any",
      images: Array.isArray(body.images) ? body.images : [],
      ownerName: body.ownerName,
      ownerPhone: body.ownerPhone,
      owner: user.id,
      available: body.available !== false,
    });
    return NextResponse.json({ room });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
