import Link from "next/link";
import { LOCALITIES } from "@/models/Room";
import { listRooms, clone } from "@/lib/mockStore";
import RoomCard from "@/components/RoomCard";
import HeroSearch from "@/components/HeroSearch";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allAvailable = listRooms({ available: true });
  const featured = allAvailable.slice(0, 6).map(clone);
  const totalRooms = allAvailable.length;

  return (
    <div className="space-y-16 md:space-y-24">
      {/* HERO */}
      <section
        id="hero"
        className="relative overflow-hidden rounded-[20px] border border-line bg-canvas-card px-6 py-12 sm:px-12 sm:py-20"
      >
        {/* warm radial */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(closest-side, #FDDF9B, transparent)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(closest-side, #F5E9D2, transparent)" }}
        />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Verified rentals · Srinagar Garhwal
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            A calmer way to find your{" "}
            <span className="bg-gradient-to-r from-accent-dark to-accent bg-clip-text text-transparent">
              next room
            </span>
            .
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Discover PGs, single rooms and shared flats near HNBGU, Bus Stand and Bada Bazaar — and connect
            directly with owners on WhatsApp.
          </p>
          <HeroSearch />

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/rooms" className="btn-primary">Browse rooms →</Link>
            <Link href="/register" className="btn-outline">List your room</Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-ink-muted">
            <Stat n={totalRooms || "—"} label="Live rooms" />
            <span className="h-4 w-px bg-line" />
            <Stat n={LOCALITIES.length} label="Localities" />
            <span className="h-4 w-px bg-line" />
            <Stat n="0" label="Brokerage" />
          </div>
        </div>
      </section>

      {/* LOCALITIES */}
      <section id="localities">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Popular localities</h2>
            <p className="mt-1 text-sm text-ink-muted">Hand-picked neighbourhoods across Srinagar.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {LOCALITIES.map((loc) => (
            <Link
              key={loc}
              href={`/rooms?locality=${encodeURIComponent(loc)}`}
              className="card card-hover flex items-center justify-center px-3 py-5 text-center text-sm font-semibold"
            >
              {loc}
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section id="featured">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Latest rooms</h2>
            <p className="mt-1 text-sm text-ink-muted">Freshly listed by owners.</p>
          </div>
          <Link href="/rooms" className="text-sm font-semibold text-ink hover:text-accent-dark">
            View all →
          </Link>
        </div>
        {featured.length === 0 ? (
          <EmptyState
            title="No rooms yet"
            description="Be the first owner to list a room on BASERA."
            action={<Link href="/register" className="btn-accent">List a room</Link>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <RoomCard key={r._id} room={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <p className="text-xl font-bold text-ink">{n}</p>
      <p className="text-xs uppercase tracking-wider text-ink-subtle">{label}</p>
    </div>
  );
}

function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-accent-light text-accent-dark text-2xl">
        ✦
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
