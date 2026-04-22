import { listRooms } from "@/lib/mockStore";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://basera.app";

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/rooms`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const rooms = listRooms({ available: true }).slice(0, 5000);
  const roomRoutes = rooms.map((r) => ({
    url: `${BASE_URL}/rooms/${r._id}`,
    lastModified: r.updatedAt ? new Date(r.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...roomRoutes];
}
