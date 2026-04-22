import Link from "next/link";
import { LOCALITIES, ROOM_TYPES, GENDERS } from "@/models/Room";
import { paginateRooms, getSavedIds, clone } from "@/lib/mockStore";
import RoomFilters from "@/components/RoomFilters";
import RoomList from "@/components/RoomList";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function RoomsPage({ searchParams }) {
  const sp = searchParams || {};
  const filter = { available: true };
  if (sp.locality) filter.locality = sp.locality;
  if (sp.roomType) filter.roomType = sp.roomType;
  if (sp.gender) filter.gender = sp.gender;
  if (sp.minPrice) filter.minPrice = Number(sp.minPrice);
  if (sp.maxPrice) filter.maxPrice = Number(sp.maxPrice);
  if (sp.q) filter.search = sp.q;

  const { rooms: pageRooms, nextCursor } = paginateRooms(filter, { limit: PAGE_SIZE });
  const rooms = pageRooms.map(clone);

  let savedIds = [];
  const user = getCurrentUser();
  if (user) savedIds = getSavedIds(user.id);

  // Build query object for client load-more
  const queryForClient = {};
  ["q", "locality", "roomType", "gender", "minPrice", "maxPrice"].forEach((k) => {
    if (sp[k]) queryForClient[k] = sp[k];
  });

  const activeFilters = [
    sp.q && { k: "q", label: `"${sp.q}"` },
    sp.locality && { k: "locality", label: sp.locality },
    sp.roomType && { k: "roomType", label: sp.roomType },
    sp.gender && { k: "gender", label: sp.gender },
    sp.minPrice && { k: "minPrice", label: `≥ ₹${sp.minPrice}` },
    sp.maxPrice && { k: "maxPrice", label: `≤ ₹${sp.maxPrice}` },
  ].filter(Boolean);

  const removeUrl = (key) => {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => { if (k !== key && v) params.set(k, v); });
    return `/rooms${params.toString() ? `?${params}` : ""}`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside id="filters">
        <RoomFilters
          options={{ localities: LOCALITIES, roomTypes: ROOM_TYPES, genders: GENDERS }}
          initial={sp}
        />
      </aside>

      <section>
        <div className="mb-5 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rooms in Srinagar</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Showing <span className="font-semibold text-ink">{rooms.length}</span>
              {nextCursor ? "+" : ""} result{rooms.length === 1 ? "" : "s"}
              {activeFilters.length > 0 && <> · {activeFilters.length} filter{activeFilters.length === 1 ? "" : "s"} applied</>}
            </p>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeFilters.map((f) => (
              <Link
                key={f.k}
                href={removeUrl(f.k)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas-card px-3 py-1 text-xs font-medium text-ink hover:border-ink/30 hover:bg-canvas-soft"
              >
                {f.label}
                <span className="text-ink-subtle">✕</span>
              </Link>
            ))}
            <Link href="/rooms" className="text-xs font-semibold text-ink-muted hover:text-ink underline underline-offset-4">
              Clear all
            </Link>
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-accent-light text-accent-dark text-2xl">
              ⌕
            </div>
            <h3 className="mt-5 text-lg font-semibold">No rooms match your filters</h3>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">
              Try widening the price range, switching locality, or clearing filters to see all available rooms.
            </p>
            <Link href="/rooms" className="btn-primary mt-6">Clear all filters</Link>
          </div>
        ) : (
          <RoomList
            initialRooms={rooms}
            initialCursor={nextCursor}
            query={queryForClient}
            savedIds={savedIds}
          />
        )}
      </section>
    </div>
  );
}
