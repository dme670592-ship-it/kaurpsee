// Lightweight in-memory mock data store used in place of MongoDB.
// Persists across HMR reloads in dev by attaching to globalThis.
//
// Provides Rooms, Users and a saved-rooms map so the entire app
// (browse, detail, dashboard, save, login/register) is fully functional
// without an external database.

import bcrypt from "bcryptjs";

const STORE_KEY = "__BASERA_MOCK_STORE__";

// 24-char hex helper so IDs *look* like Mongo ObjectIds (kept for nicer URLs).
function genId() {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 24; i++) out += chars[Math.floor(Math.random() * 16)];
  return out;
}

const img = (id) => `https://images.unsplash.com/${id}?w=1200&auto=format&fit=crop`;

// Curated photo sets per room style.
const PHOTOS = {
  bright: ["photo-1505691938895-1758d7feb511", "photo-1522708323590-d24dbb6b0267", "photo-1540518614846-7eded433c457"],
  cozy:   ["photo-1493809842364-78817add7ffb", "photo-1502672260266-1c1ef2d93688", "photo-1505693416388-ac5ce068fe85"],
  modern: ["photo-1560448204-e02f11c3d0e2", "photo-1554995207-c18c203602cb", "photo-1598928506311-c55ded91a20c"],
  loft:   ["photo-1560185007-cde436f6a4d0", "photo-1567016526105-22da7c13161a", "photo-1556909211-d5b2bcaa9e3a"],
  minimal:["photo-1522771739844-6a9f6d5f14af", "photo-1494203484021-3c454daf695d", "photo-1513694203232-719a280e022f"],
};

function buildSeed() {
  const ownerId = genId();
  const seekerId = genId();

  const now = Date.now();
  // bcrypt hash of "password123" — pre-computed at module load time.
  const demoHash = bcrypt.hashSync("password123", 10);

  const users = [
    {
      _id: ownerId,
      name: "Demo Owner",
      email: "owner@basera.dev",
      password: demoHash,
      phone: "9876543210",
      role: "owner",
      savedRooms: [],
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
    {
      _id: seekerId,
      name: "Demo Seeker",
      email: "seeker@basera.dev",
      password: demoHash,
      phone: "9000000000",
      role: "seeker",
      savedRooms: [],
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 25).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 25).toISOString(),
    },
  ];

  const ROOM_DEFS = [
    {
      title: "Bright single room near HNBGU main gate",
      description: "Furnished single room 2 minutes walk from HNBGU campus. Includes WiFi, hot water and study table. Ideal for serious students who want zero commute.",
      price: 4500, roomType: "Single", locality: "HNBGU Campus", gender: "Male",
      amenities: ["WiFi", "Hot Water", "Furnished", "Study Table", "Power Backup"],
      photos: PHOTOS.bright,
      ownerName: "Rakesh Bisht", ownerPhone: "9876543210",
    },
    {
      title: "Affordable shared PG for girls — Bada Bazaar",
      description: "Twin sharing PG with home-cooked meals, secure entry and a friendly warden. Walking distance to Bada Bazaar market and ATMs.",
      price: 3200, roomType: "PG", locality: "Bada Bazaar", gender: "Female",
      amenities: ["WiFi", "Hot Water", "Furnished", "Kitchen", "Water Tank"],
      photos: PHOTOS.cozy,
      ownerName: "Sunita Devi", ownerPhone: "9810012345",
    },
    {
      title: "Spacious 1BHK in Parasnath Colony",
      description: "Independent 1BHK with private kitchen, attached bathroom and balcony with valley views. Perfect for couples or working professionals.",
      price: 8000, roomType: "1BHK", locality: "Parasnath Colony", gender: "Any",
      amenities: ["Furnished", "Kitchen", "Attached Bathroom", "Balcony", "Parking", "Power Backup"],
      photos: PHOTOS.modern,
      ownerName: "Manoj Negi", ownerPhone: "9756123456",
    },
    {
      title: "Budget double room near Bus Stand",
      description: "Twin sharing room walking distance from Srinagar bus stand. Easy access to shops, ATMs, eateries and shared autos.",
      price: 2800, roomType: "Double", locality: "Bus Stand", gender: "Male",
      amenities: ["WiFi", "Hot Water", "Water Tank"],
      photos: PHOTOS.loft,
      ownerName: "Vikas Rawat", ownerPhone: "9999988888",
    },
    {
      title: "Quiet single room — Chaura Maidan",
      description: "Calm neighborhood, close to walking trails. Good natural light, well ventilated and clean. Suits remote workers and writers.",
      price: 3500, roomType: "Single", locality: "Chaura Maidan", gender: "Any",
      amenities: ["WiFi", "Hot Water", "Furnished", "Study Table"],
      photos: PHOTOS.minimal,
      ownerName: "Asha Pant", ownerPhone: "9012345678",
    },
    {
      title: "2BHK family flat — Gauchar Road",
      description: "Two bedroom flat with covered parking, suitable for families. Power backup available throughout the year, hill-facing balcony.",
      price: 7500, roomType: "2BHK", locality: "Gauchar Road", gender: "Any",
      amenities: ["Furnished", "Parking", "Power Backup", "Kitchen", "Balcony", "Attached Bathroom"],
      photos: PHOTOS.modern,
      ownerName: "Deepak Joshi", ownerPhone: "9711122233",
    },
    {
      title: "Shared room for boys — HNBGU Campus",
      description: "Triple sharing student-friendly room. Common kitchen access. Mess available next door with monthly plans.",
      price: 2500, roomType: "Shared", locality: "HNBGU Campus", gender: "Male",
      amenities: ["WiFi", "Hot Water", "Kitchen", "Study Table"],
      photos: PHOTOS.cozy,
      ownerName: "Pankaj Semwal", ownerPhone: "9633344455",
    },
    {
      title: "Furnished girls PG with mess — Bada Bazaar",
      description: "Single occupancy PG with breakfast and dinner included. Secure premises with female caretaker and CCTV at entry.",
      price: 6000, roomType: "PG", locality: "Bada Bazaar", gender: "Female",
      amenities: ["WiFi", "Hot Water", "Furnished", "Kitchen", "Power Backup", "Attached Bathroom"],
      photos: PHOTOS.loft,
      ownerName: "Reena Thapa", ownerPhone: "9844455566",
    },
    {
      title: "Sunny studio with balcony — Parasnath Colony",
      description: "Compact studio with private balcony, kitchenette and a fast-WiFi study corner. Great for solo professionals.",
      price: 5500, roomType: "Single", locality: "Parasnath Colony", gender: "Any",
      amenities: ["WiFi", "Furnished", "Balcony", "Kitchen", "Hot Water", "Study Table"],
      photos: PHOTOS.minimal,
      ownerName: "Ananya Rana", ownerPhone: "9888877766",
    },
    {
      title: "Premium 1BHK with hill view — Gauchar Road",
      description: "Newly renovated 1BHK with full furnishing, attached bathroom and a quiet street. Power backup and parking included.",
      price: 9000, roomType: "1BHK", locality: "Gauchar Road", gender: "Any",
      amenities: ["WiFi", "Hot Water", "Furnished", "Attached Bathroom", "Parking", "Power Backup", "Balcony"],
      photos: PHOTOS.modern,
      ownerName: "Karan Bhatt", ownerPhone: "9555566677",
    },
  ];

  const rooms = ROOM_DEFS.map((def, i) => {
    const id = genId();
    // Stagger createdAt so newest comes first naturally.
    const created = new Date(now - i * 1000 * 60 * 60 * 6).toISOString();
    return {
      _id: id,
      title: def.title,
      description: def.description,
      price: def.price,
      roomType: def.roomType,
      locality: def.locality,
      amenities: def.amenities,
      gender: def.gender,
      images: def.photos.map(img),
      ownerName: def.ownerName,
      ownerPhone: def.ownerPhone,
      owner: ownerId,
      available: true,
      createdAt: created,
      updatedAt: created,
    };
  });

  return { users, rooms };
}

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = buildSeed();
  }
  return globalThis[STORE_KEY];
}

// ---------- ROOMS ----------

function matchRoom(room, filter) {
  if (filter.available !== undefined && room.available !== filter.available) return false;
  if (filter.locality && room.locality !== filter.locality) return false;
  if (filter.roomType && room.roomType !== filter.roomType) return false;
  if (filter.gender && room.gender !== filter.gender) return false;
  if (filter.owner && String(room.owner) !== String(filter.owner)) return false;
  if (filter.minPrice && room.price < filter.minPrice) return false;
  if (filter.maxPrice && room.price > filter.maxPrice) return false;
  if (filter.search) {
    const s = filter.search.toLowerCase();
    const hay = `${room.title} ${room.description}`.toLowerCase();
    if (!hay.includes(s)) return false;
  }
  return true;
}

export function listRooms(filter = {}) {
  const { rooms } = getStore();
  return rooms
    .filter((r) => matchRoom(r, filter))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function paginateRooms(filter, { cursor, limit = 12 } = {}) {
  let all = listRooms(filter);
  if (cursor) {
    const idx = all.findIndex((r) => String(r._id) === String(cursor));
    if (idx >= 0) all = all.slice(idx + 1);
  }
  const slice = all.slice(0, limit);
  const nextCursor = all.length > limit ? String(slice[slice.length - 1]._id) : null;
  return { rooms: slice, nextCursor };
}

export function getRoomById(id) {
  const { rooms } = getStore();
  return rooms.find((r) => String(r._id) === String(id)) || null;
}

export function createRoom(data) {
  const { rooms } = getStore();
  const now = new Date().toISOString();
  const room = {
    _id: genId(),
    title: data.title,
    description: data.description,
    price: Number(data.price),
    roomType: data.roomType,
    locality: data.locality,
    amenities: Array.isArray(data.amenities) ? data.amenities : [],
    gender: data.gender || "Any",
    images: Array.isArray(data.images) ? data.images : [],
    ownerName: data.ownerName,
    ownerPhone: data.ownerPhone,
    owner: data.owner,
    available: data.available !== false,
    createdAt: now,
    updatedAt: now,
  };
  rooms.unshift(room);
  return room;
}

export function updateRoom(id, updates) {
  const { rooms } = getStore();
  const idx = rooms.findIndex((r) => String(r._id) === String(id));
  if (idx < 0) return null;
  const allowed = ["title", "description", "price", "roomType", "locality", "amenities", "gender", "images", "ownerName", "ownerPhone", "available"];
  for (const f of allowed) {
    if (f in updates) {
      rooms[idx][f] = f === "price" ? Number(updates[f]) : updates[f];
    }
  }
  rooms[idx].updatedAt = new Date().toISOString();
  return rooms[idx];
}

export function deleteRoom(id) {
  const store = getStore();
  const idx = store.rooms.findIndex((r) => String(r._id) === String(id));
  if (idx < 0) return false;
  store.rooms.splice(idx, 1);
  // Clean up any saved references.
  for (const u of store.users) {
    u.savedRooms = u.savedRooms.filter((rid) => String(rid) !== String(id));
  }
  return true;
}

export function similarRooms(id, limit = 4) {
  const room = getRoomById(id);
  if (!room) return [];
  const { rooms } = getStore();
  const minP = room.price * 0.7;
  const maxP = room.price * 1.3;
  return rooms
    .filter(
      (r) =>
        String(r._id) !== String(room._id) &&
        r.available &&
        (r.locality === room.locality ||
          r.roomType === room.roomType ||
          (r.price >= minP && r.price <= maxP))
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

// ---------- USERS ----------

export function findUserByEmail(email) {
  const { users } = getStore();
  const target = String(email || "").toLowerCase();
  return users.find((u) => u.email === target) || null;
}

export function findUserById(id) {
  const { users } = getStore();
  return users.find((u) => String(u._id) === String(id)) || null;
}

export function createUser({ name, email, password, phone, role }) {
  const store = getStore();
  const user = {
    _id: genId(),
    name,
    email: String(email).toLowerCase(),
    password, // already hashed by caller
    phone,
    role: role || "seeker",
    savedRooms: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.users.push(user);
  return user;
}

// ---------- SAVED ----------

export function getSavedIds(userId) {
  const u = findUserById(userId);
  if (!u) return [];
  return u.savedRooms.map(String);
}

export function saveRoomForUser(userId, roomId) {
  const u = findUserById(userId);
  if (!u) return false;
  if (!getRoomById(roomId)) return false;
  if (!u.savedRooms.some((id) => String(id) === String(roomId))) {
    u.savedRooms.push(roomId);
  }
  return true;
}

export function unsaveRoomForUser(userId, roomId) {
  const u = findUserById(userId);
  if (!u) return false;
  u.savedRooms = u.savedRooms.filter((id) => String(id) !== String(roomId));
  return true;
}

export function getSavedRooms(userId) {
  const ids = getSavedIds(userId);
  if (ids.length === 0) return [];
  const { rooms } = getStore();
  // Preserve "most recently saved first"
  return ids
    .map((id) => rooms.find((r) => String(r._id) === String(id)))
    .filter(Boolean)
    .reverse();
}

// Helper to safely deep-clone for client serialization.
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
