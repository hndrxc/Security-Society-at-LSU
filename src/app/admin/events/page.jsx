import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../utils/supabase/server";

// Helper to verify admin authorization
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return supabase;
}

export default async function EventsPage() {
  const supabase = await requireAdmin();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Events</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage club events and operations.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:bg-amber-300"
        >
          + New Event
        </Link>
      </div>

      {/* Event list */}
      {!events?.length ? (
        <div className="clip-cyber border border-purple-900/50 bg-black/60 p-8 text-center">
          <div className="font-terminal mb-4 text-4xl text-purple-500/40">[NO DATA]</div>
          <p className="text-slate-400">No events yet.</p>
          <Link
            href="/admin/events/new"
            className="mt-4 inline-block rounded border border-amber-500/50 bg-amber-500/10 px-4 py-2 font-terminal text-sm text-amber-300 hover:bg-amber-500/20"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const now = new Date();
            const start = new Date(event.starts_at);
            const end = new Date(event.ends_at || event.starts_at);
            const isUpcoming = now < start;
            const isActive = now >= start && now <= end;
            const isEnded = now > end;

            return (
              <div
                key={event.id}
                className="clip-cyber border border-purple-900/50 bg-black/60 p-4 transition-colors hover:border-purple-500/50"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-white">{event.title}</h2>
                      <span className={`rounded px-2 py-0.5 font-terminal text-xs ${
                        event.is_visible
                          ? 'bg-[#39ff14]/20 text-[#39ff14]'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {event.is_visible ? 'VISIBLE' : 'HIDDEN'}
                      </span>
                      <span className={`rounded px-2 py-0.5 font-terminal text-xs ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300'
                          : isUpcoming
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {isActive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'ENDED'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 font-terminal text-xs text-slate-500">
                      {event.location && (
                        <span>
                          LOCATION: <span className="text-slate-400">{event.location}</span>
                        </span>
                      )}
                      <span>
                        START: <span className="text-slate-400">{start.toLocaleString()}</span>
                      </span>
                      {event.ends_at && (
                        <span>
                          END: <span className="text-slate-400">{end.toLocaleString()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="rounded border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 font-terminal text-xs text-amber-300 hover:bg-amber-500/20"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
