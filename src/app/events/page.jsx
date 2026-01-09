// src/app/events/page.jsx
import Navbar from "@/components/Navbar";
import { createClient } from "../../../utils/supabase/server";
import { getAuthData } from "../../../utils/auth/getAuthData";

export const revalidate = 60;

export default async function EventsPage() {
  const supabase = await createClient();
  const { user, profile } = await getAuthData();

  const { data: events, error } = await supabase
    .from("events")
    .select("id,title,description,starts_at,ends_at,location,timezone")
    .eq("is_visible", true)
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0d0a14] to-black text-slate-100 cyber-grid">
      {/* Animated blur orbs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-purple-700/40 blur-3xl" style={{ animation: 'slow-pulse 8s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute bottom-0 right-[-80px] h-72 w-72 rounded-full bg-amber-500/30 blur-3xl" style={{ animation: 'slow-pulse 10s ease-in-out infinite 1s' }} />

      {/* Decorative corner brackets */}
      <div className="pointer-events-none absolute left-6 top-6 h-8 w-8 border-l-2 border-t-2 border-purple-500/30" />
      <div className="pointer-events-none absolute right-6 top-6 h-8 w-8 border-r-2 border-t-2 border-amber-500/30" />
      <div className="pointer-events-none absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2 border-purple-500/30" />
      <div className="pointer-events-none absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-amber-500/30" />

      <Navbar user={user} profile={profile} currentPath="/events" />

      <main className="mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6 sm:pb-16">
        <section className="relative flex flex-col gap-6 clip-cyber-reverse border-l-4 border-l-amber-400 border border-purple-900/50 bg-[#0f0d16]/80 p-7 shadow-2xl shadow-purple-900/40 backdrop-blur sm:gap-8 sm:p-12">
          {/* Scanline overlay */}
          <div className="scanline-overlay pointer-events-none absolute inset-0 opacity-30" />

          <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {/* Terminal intro */}
              <div className="font-terminal mb-2 text-xs text-purple-400">
                <span className="text-amber-400">[SYS]</span>
                <span className="ml-2 text-slate-400">LOADING EVENT QUEUE...</span>
              </div>
              <p className="font-terminal text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">[OPS] Mission Calendar</p>
              <h1 className="rgb-hover text-3xl font-semibold text-white sm:text-4xl">Upcoming Operations</h1>
              <p className="text-sm text-slate-300">
                Find our latest meetups, workshops, and competitions.
              </p>
            </div>
            <div className="font-terminal text-right text-xs">
              <div className="text-[#39ff14]">STATUS: ACTIVE</div>
              <div className="text-slate-500">EVENTS: {events?.length || 0}</div>
            </div>
            {error && (
              <p className="font-terminal rounded border border-amber-400/70 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-amber-200">
                [ERROR] Unable to load events
              </p>
            )}
          </div>

          {/* Timeline container */}
          <div className="relative pl-8">
            {/* Vertical timeline line */}
            {events?.length > 0 && (
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-purple-500/50 to-transparent" />
            )}

            {!events?.length && !error && (
              <div className="clip-cyber border border-purple-900/50 bg-black/50 p-8 text-center shadow-lg shadow-purple-900/30">
                <div className="font-terminal mb-4 text-5xl text-purple-500/40">[NO DATA]</div>
                <p className="font-terminal text-amber-300">AWAITING MISSION BRIEFING...</p>
                <p className="mt-2 text-sm text-slate-500">Check back soon for upcoming operations.</p>
              </div>
            )}

            <div className="stagger-children space-y-6">
              {events?.map((event, index) => (
                <article
                  key={event.id}
                  className="animate-slide-up hover-glow relative clip-cyber border-l-4 border-l-amber-400 border border-purple-900/60 bg-black/60 p-6 shadow-lg shadow-purple-900/30"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[29px] top-6 h-3 w-3 rounded-full border-2 border-purple-900 bg-amber-400 shadow-lg shadow-amber-400/50" />

                  {/* Classification badge */}
                  <span className="font-terminal absolute right-3 bottom-3 rounded bg-purple-800/50 px-2 py-1 text-[10px] text-amber-200">
                    EVENT-{String(index + 1).padStart(3, '0')}
                  </span>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2">
                      <h2 className="rgb-hover text-xl font-semibold text-white">
                        <span className="font-terminal mr-2 text-sm text-purple-400">[MISSION]</span>
                        {event.title}
                      </h2>
                      {event.location && (
                        <p className="font-terminal text-sm text-amber-200">
                          <span className="text-slate-500">LOC:</span> {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm leading-6 text-slate-300">{event.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-1 font-semibold text-slate-200 sm:items-end">
                      <div className="font-terminal text-xs">
                        <span className="text-[#39ff14]">START:</span>
                        <span className="ml-2 text-slate-300">{new Date(event.starts_at).toLocaleString("en-US", { timeZone: event.timezone || "America/Chicago" })}</span>
                      </div>
                      {event.ends_at && (
                        <div className="font-terminal text-xs text-slate-400">
                          <span className="text-slate-500">END:</span>
                          <span className="ml-2">{new Date(event.ends_at).toLocaleString("en-US", { timeZone: event.timezone || "America/Chicago" })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
