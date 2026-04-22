import Link from "next/link";
import { redirect } from "next/navigation";
import { listRooms, clone } from "@/lib/mockStore";
import { getCurrentUser } from "@/lib/auth";
import DashboardRow from "@/components/DashboardRow";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role !== "owner") redirect("/rooms");

  const rooms = listRooms({ owner: user.id }).map(clone);

  const visible = rooms.filter((r) => r.available).length;
  const totalValue = rooms.reduce((s, r) => s + (r.price || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Owner dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Hi, {user.name?.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-sm text-ink-muted">Manage and update your room listings.</p>
        </div>
        <Link href="/dashboard/new" className="btn-accent" id="new-listing-btn">+ New listing</Link>
      </div>

      {rooms.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total listings" value={rooms.length} />
          <Stat label="Visible to seekers" value={visible} accent />
          <Stat label="Combined monthly value" value={`₹${totalValue.toLocaleString("en-IN")}`} />
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-accent-light text-accent-dark text-2xl">
            ✦
          </div>
          <h3 className="mt-5 text-lg font-semibold">No listings yet</h3>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">
            Create your first listing in 5 quick steps. Add a few photos, set a price, and you&apos;re live.
          </p>
          <Link href="/dashboard/new" className="btn-primary mt-6">Create your first listing</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas-soft text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-4 py-3.5">Title</th>
                  <th className="px-4 py-3.5">Locality</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rooms.map((r) => (
                  <DashboardRow key={r._id} room={r} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${accent ? "text-accent-dark" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
