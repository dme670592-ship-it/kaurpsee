import Link from "next/link";
import { redirect } from "next/navigation";
import { getSavedRooms, clone } from "@/lib/mockStore";
import RoomCard from "@/components/RoomCard";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Saved rooms · BASERA",
  description: "Your bookmarked rooms in Srinagar Garhwal.",
};

export default async function SavedPage() {
  const user = getCurrentUser();
  if (!user) redirect("/login?next=/saved");

  const rooms = getSavedRooms(user.id).map(clone);

  return (
    <div className="space-y-8" id="saved-page">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Your collection</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Saved rooms</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {rooms.length === 0
              ? "You haven't saved any rooms yet."
              : `${rooms.length} room${rooms.length === 1 ? "" : "s"} saved.`}
          </p>
        </div>
        <Link href="/rooms" className="btn-outline">Browse rooms →</Link>
      </div>

      {rooms.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-accent-light text-accent-dark text-2xl">
            ♡
          </div>
          <h3 className="mt-5 text-lg font-semibold">No saved rooms yet</h3>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">
            Tap the bookmark icon on any room card to save it here for later.
          </p>
          <Link href="/rooms" className="btn-primary mt-6">Browse rooms</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((r) => (
            <RoomCard key={r._id} room={r} saved={true} />
          ))}
        </div>
      )}
    </div>
  );
}
