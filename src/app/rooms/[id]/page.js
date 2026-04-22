import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoomById, similarRooms, getSavedIds, clone } from "@/lib/mockStore";
import RoomCard from "@/components/RoomCard";
import RoomGallery from "@/components/RoomGallery";
import SaveButton from "@/components/SaveButton";
import OwnerControls from "@/components/OwnerControls";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const FALLBACK_OG = "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format&fit=crop";

function siteUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://basera.app";
}

export async function generateMetadata({ params }) {
  const room = getRoomById(params.id);
  if (!room) return { title: "Room not found · BASERA" };

  const title = `${room.title} · ₹${room.price.toLocaleString("en-IN")}/mo in ${room.locality} · BASERA`;
  const desc =
    (room.description || "").slice(0, 160).replace(/\s+/g, " ").trim() ||
    `${room.roomType} room in ${room.locality}, Srinagar Garhwal — ₹${room.price.toLocaleString("en-IN")}/mo. Contact owner directly on BASERA.`;
  const image = room.images?.[0] || FALLBACK_OG;
  const url = `${siteUrl()}/rooms/${params.id}`;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: room.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [image],
    },
  };
}

export default async function RoomDetailPage({ params }) {
  const room = getRoomById(params.id);
  if (!room) notFound();

  const currentUser = getCurrentUser();
  let isSaved = false;
  if (currentUser) {
    isSaved = getSavedIds(currentUser.id).includes(String(room._id));
  }
  const isOwner = currentUser && String(room.owner) === String(currentUser.id);

  const similar = similarRooms(room._id).map(clone);

  const phone = String(room.ownerPhone).replace(/\D/g, "");
  const waMsg = encodeURIComponent(`Hi ${room.ownerName}, I'm interested in your room "${room.title}" listed on BASERA.`);
  const r = clone(room);

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          ← Back to listings
        </Link>
      </div>

      {isOwner && (
        <OwnerControls roomId={r._id} initialAvailable={r.available} />
      )}

      <RoomGallery images={r.images} title={r.title} />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{r.title}</h1>
              {!isOwner && (
                <SaveButton roomId={r._id} saved={isSaved} variant="full" className="shrink-0" />
              )}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-ink-muted">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 11s4-3.5 4-7a4 4 0 1 0-8 0c0 3.5 4 7 4 7z" />
                <circle cx="6" cy="4" r="1.3" />
              </svg>
              {r.locality}, Srinagar (Garhwal)
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge-accent">{r.roomType}</span>
              <span className="badge">For {r.gender}</span>
              <span className={`badge ${r.available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                {r.available ? "Available now" : "Currently unavailable"}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight">About this room</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">{r.description}</p>
          </div>

          {r.amenities?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold tracking-tight">What's included</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {r.amenities.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 rounded-[10px] border border-line bg-canvas-card px-3 py-2.5 text-sm font-medium text-ink"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent-light text-accent-dark text-[11px] font-bold">✓</span>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="card sticky top-24 h-fit space-y-4 p-6" id="contact-card">
          <div className="border-b border-line pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Monthly rent</p>
            <p className="mt-1 text-3xl font-bold text-accent-dark">
              ₹{r.price.toLocaleString("en-IN")}
              <span className="text-sm font-medium text-ink-muted">/mo</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Listed by</p>
            <p className="mt-1 font-semibold text-ink">{r.ownerName}</p>
            <p className="text-sm text-ink-muted">+91 {phone}</p>
          </div>
          <a
            id="whatsapp-btn"
            href={`https://wa.me/91${phone}?text=${waMsg}`}
            target="_blank"
            rel="nofollow noreferrer"
            className="btn w-full bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-px shadow-soft"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.337 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            WhatsApp owner
          </a>
          <a id="call-btn" href={`tel:+91${phone}`} className="btn-outline w-full">
            📞 Call owner
          </a>
          <p className="rounded-[10px] bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            <strong>Stay safe:</strong> always inspect the property in person before paying any deposit.
          </p>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="border-t border-line pt-10">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">You might also like</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <RoomCard key={s._id} room={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
