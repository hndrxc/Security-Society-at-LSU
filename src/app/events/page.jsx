import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "../../../utils/supabase/server";
import { getAuthData } from "../../../utils/auth/getAuthData";

export const revalidate = 60;

export const metadata = {
  title: "Events & CTF | Security Society at LSU",
  description: "Upcoming Security Society events and active CTF competitions.",
};

const DEFAULT_TIME_ZONE = "America/Chicago";
const EVENT_COLUMNS = "id,title,description,starts_at,ends_at,location,timezone,image_path";
const EVENT_COLUMNS_WITHOUT_TIMEZONE = "id,title,description,starts_at,ends_at,location,image_path";

function isMissingTimezoneColumn(error) {
  return Boolean(
    error &&
      (error.code === "42703" || error.code === "PGRST204") &&
      error.message?.includes("timezone"),
  );
}

function createVisibleEventsQuery(supabase, now, columns) {
  return supabase
    .from("events")
    .select(columns)
    .eq("is_visible", true)
    .or(`ends_at.gte.${now},and(ends_at.is.null,starts_at.gte.${now})`)
    .order("starts_at", { ascending: true });
}

async function getVisibleEvents(supabase, now) {
  const result = await createVisibleEventsQuery(supabase, now, EVENT_COLUMNS);

  // Migration 009 adds timezone. Keep event listings available while an
  // environment is being upgraded instead of failing the entire query.
  if (isMissingTimezoneColumn(result.error)) {
    return createVisibleEventsQuery(supabase, now, EVENT_COLUMNS_WITHOUT_TIMEZONE);
  }

  return result;
}

function formatDate(date, timeZone = DEFAULT_TIME_ZONE) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(date));
}

function getCompetitionStatus(competition, now) {
  const start = new Date(competition.starts_at);
  const end = new Date(competition.ends_at);

  if (now < start) return { label: "UPCOMING", color: "text-amber-400" };
  if (now > end) return { label: "ENDED", color: "text-slate-500" };
  return { label: "ACTIVE", color: "text-[#39ff14]" };
}

function countByCompetition(rows) {
  return (rows || []).reduce((counts, row) => {
    counts[row.competition_id] = (counts[row.competition_id] || 0) + 1;
    return counts;
  }, {});
}

export default async function EventsPage() {
  const supabase = await createClient();
  const now = new Date();
  const nowIso = now.toISOString();

  const [auth, eventsResult, competitionsResult] = await Promise.all([
    getAuthData(),
    getVisibleEvents(supabase, nowIso),
    supabase
      .from("ctf_competitions")
      .select("id,title,description,starts_at,ends_at,is_active")
      .eq("is_active", true)
      .order("starts_at", { ascending: true }),
  ]);

  const { user, profile } = auth;
  const { data: events, error: eventsError } = eventsResult;
  const { data: competitions, error: competitionsError } = competitionsResult;
  const competitionIds = (competitions || []).map((competition) => competition.id);

  let challengeCounts = {};
  let userSolves = {};

  if (competitionIds.length > 0) {
    const [challengesResult, solvesResult] = await Promise.all([
      supabase
        .from("ctf_challenges")
        .select("competition_id")
        .in("competition_id", competitionIds)
        .eq("is_visible", true),
      user
        ? supabase
            .from("ctf_solves")
            .select("competition_id")
            .eq("user_id", user.id)
            .in("competition_id", competitionIds)
        : Promise.resolve({ data: [] }),
    ]);

    challengeCounts = countByCompetition(challengesResult.data);
    userSolves = countByCompetition(solvesResult.data);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0d0a14] to-black text-slate-100 cyber-grid">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-purple-700/40 blur-3xl animate-slow-pulse" />
      <div className="pointer-events-none absolute bottom-0 right-[-80px] h-72 w-72 rounded-full bg-amber-500/30 blur-3xl animate-slow-pulse-delayed" />

      <div className="pointer-events-none absolute left-6 top-6 h-8 w-8 border-l-2 border-t-2 border-purple-500/30" />
      <div className="pointer-events-none absolute right-6 top-6 h-8 w-8 border-r-2 border-t-2 border-amber-500/30" />
      <div className="pointer-events-none absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2 border-purple-500/30" />
      <div className="pointer-events-none absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-amber-500/30" />

      <Navbar user={user} profile={profile} currentPath="/events" />

      <main id="main-content" className="mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6 sm:pb-16">
        <section className="relative flex flex-col gap-8 clip-cyber-reverse border-l-4 border-l-amber-400 border border-purple-900/50 bg-[#0f0d16]/80 p-7 shadow-2xl shadow-purple-900/40 backdrop-blur sm:p-12">
          <div className="scanline-overlay pointer-events-none absolute inset-0 opacity-30" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="font-terminal mb-2 text-xs text-purple-400">
                <span className="text-amber-400">[SYS]</span>
                <span className="ml-2 text-slate-400">LOADING OPERATIONS HUB...</span>
              </div>
              <p className="font-terminal text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                [OPS] Events &amp; Capture The Flag
              </p>
              <h1 className="rgb-hover text-3xl font-semibold text-white sm:text-4xl">Upcoming Operations</h1>
              <p className="text-sm text-slate-300">
                Find our latest meetups, workshops, and CTF competitions in one place.
              </p>
            </div>
            <div className="font-terminal shrink-0 text-xs sm:text-right">
              <div className="text-[#39ff14]">STATUS: OPERATIONAL</div>
              <div className="text-slate-500">EVENTS: {events?.length || 0}</div>
              <div className="text-slate-500">CTFS: {competitions?.length || 0}</div>
            </div>
          </div>

          <nav aria-label="Operations sections" className="relative flex flex-wrap gap-3 border-y border-purple-900/50 py-4">
            <a
              href="#events"
              className="font-terminal rounded-full border border-purple-700/60 bg-purple-800/30 px-4 py-2 text-xs uppercase tracking-wider text-purple-100 transition-colors hover:bg-purple-700/50 hover:text-amber-200"
            >
              Club Events
            </a>
            <a
              href="#ctf"
              className="font-terminal rounded-full border border-purple-700/60 bg-purple-800/30 px-4 py-2 text-xs uppercase tracking-wider text-purple-100 transition-colors hover:bg-purple-700/50 hover:text-amber-200"
            >
              CTF Competitions
            </a>
          </nav>

          <div id="events" className="relative scroll-mt-6">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="font-terminal text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">[CALENDAR]</p>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">Club Events</h2>
              </div>
              <span className="font-terminal text-xs text-slate-500">{events?.length || 0} SCHEDULED</span>
            </div>

            {eventsError && (
              <p className="font-terminal mb-6 rounded border border-amber-400/70 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-amber-200">
                [ERROR] Unable to load events
              </p>
            )}

            <div className="relative pl-8">
              {events?.length > 0 ? (
                <div className="absolute bottom-0 left-3 top-0 w-px bg-gradient-to-b from-purple-500 via-purple-500/50 to-transparent" />
              ) : null}

              {!events?.length && !eventsError && (
                <div className="clip-cyber border border-purple-900/50 bg-black/50 p-8 text-center shadow-lg shadow-purple-900/30">
                  <div className="font-terminal mb-4 text-5xl text-purple-500/40">[NO DATA]</div>
                  <p className="font-terminal text-amber-300">AWAITING MISSION BRIEFING...</p>
                  <p className="mt-2 text-sm text-slate-500">Check back soon for upcoming club events.</p>
                </div>
              )}

              <div className="stagger-children space-y-6">
                {events?.map((event) => (
                  <article
                    key={event.id}
                    className="animate-slide-up hover-glow relative overflow-hidden clip-cyber border-l-4 border-l-amber-400 border border-purple-900/60 bg-black/60 shadow-lg shadow-purple-900/30"
                  >
                    <div className="absolute -left-[29px] top-6 z-10 h-3 w-3 rounded-full border-2 border-purple-900 bg-amber-400 shadow-lg shadow-amber-400/50" />

                    {event.image_path && supabaseUrl ? (
                      <div className="relative aspect-[21/9] w-full overflow-hidden">
                        <Image
                          src={`${supabaseUrl}/storage/v1/object/public/event-media/${event.image_path}`}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 832px, (min-width: 640px) calc(100vw - 160px), calc(100vw - 96px)"
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-col gap-2 sm:max-w-xl">
                        <h3 className="rgb-hover text-xl font-semibold text-white">
                          <span className="font-terminal mr-2 text-sm text-purple-400">[MISSION]</span>
                          {event.title}
                        </h3>
                        {event.location && (
                          <p className="font-terminal text-sm text-amber-200">
                            <span className="text-slate-500">LOC:</span> {event.location}
                          </p>
                        )}
                        {event.description && <p className="text-sm leading-6 text-slate-300">{event.description}</p>}
                      </div>
                      <div className="flex shrink-0 flex-col items-start gap-1 whitespace-nowrap font-semibold text-slate-200 sm:items-end">
                        <div className="font-terminal text-xs">
                          <span className="text-[#39ff14]">START:</span>
                          <span className="ml-2 text-slate-300">{formatDate(event.starts_at, event.timezone || DEFAULT_TIME_ZONE)}</span>
                        </div>
                        {event.ends_at && (
                          <div className="font-terminal text-xs text-slate-400">
                            <span className="text-slate-500">END:</span>
                            <span className="ml-2">{formatDate(event.ends_at, event.timezone || DEFAULT_TIME_ZONE)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          <div id="ctf" className="relative scroll-mt-6">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="font-terminal text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">[CTF] Capture The Flag</p>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">CTF Competitions</h2>
                <p className="text-sm text-slate-300">Capture flags, solve challenges, and climb the leaderboard.</p>
              </div>
              <span className="font-terminal text-xs text-slate-500">{competitions?.length || 0} AVAILABLE</span>
            </div>

            {!user && (
              <div className="mb-6 clip-cyber border border-amber-400/50 bg-amber-500/10 p-4">
                <p className="font-terminal text-sm text-amber-200">
                  <span className="text-amber-400">[INFO]</span>
                  <Link href="/login" className="ml-2 underline hover:text-amber-100">Log in</Link>{" "}
                  to submit flags and track your progress.
                </p>
              </div>
            )}

            {competitionsError && (
              <p className="font-terminal mb-6 rounded border border-amber-400/70 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-amber-200">
                [ERROR] Unable to load competitions
              </p>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {!competitions?.length && !competitionsError && (
                <div className="md:col-span-2 clip-cyber border border-purple-900/50 bg-black/50 p-8 text-center shadow-lg shadow-purple-900/30">
                  <div className="font-terminal mb-4 text-5xl text-purple-500/40">[NO DATA]</div>
                  <p className="font-terminal text-amber-300">NO ACTIVE COMPETITIONS...</p>
                  <p className="mt-2 text-sm text-slate-500">Check back soon for upcoming CTF events.</p>
                </div>
              )}

              {competitions?.map((competition, index) => {
                const status = getCompetitionStatus(competition, now);
                const challengeCount = challengeCounts[competition.id] || 0;
                const solveCount = userSolves[competition.id] || 0;

                return (
                  <Link
                    key={competition.id}
                    href={`/ctf/${competition.id}`}
                    className="group animate-slide-up hover-glow relative clip-cyber border-l-4 border-l-amber-400 border border-purple-900/60 bg-black/60 p-6 shadow-lg shadow-purple-900/30 transition-all hover:border-purple-500/80 hover:bg-black/80"
                  >
                    <span className="font-terminal absolute right-3 top-3 rounded bg-purple-800/50 px-2 py-1 text-[10px] text-amber-200">
                      CTF-{String(index + 1).padStart(3, "0")}
                    </span>

                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="font-terminal mb-1 text-xs">
                          <span className={status.color}>[{status.label}]</span>
                        </div>
                        <h3 className="rgb-hover pr-16 text-xl font-semibold text-white group-hover:text-amber-200">
                          {competition.title}
                        </h3>
                      </div>

                      {competition.description && (
                        <p className="line-clamp-2 text-sm leading-6 text-slate-300">{competition.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 font-terminal text-xs">
                        <div>
                          <span className="text-slate-500">CHALLENGES:</span>
                          <span className="ml-2 text-purple-300">{challengeCount}</span>
                        </div>
                        {user && (
                          <div>
                            <span className="text-slate-500">SOLVED:</span>
                            <span className="ml-2 text-[#39ff14]">{solveCount}/{challengeCount}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 font-terminal text-xs text-slate-400">
                        <div>
                          <span className="text-slate-500">START:</span>
                          <span className="ml-2">{formatDate(competition.starts_at)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">END:</span>
                          <span className="ml-2">{formatDate(competition.ends_at)}</span>
                        </div>
                      </div>

                      <div className="font-terminal text-xs text-purple-400 group-hover:text-amber-300">
                        [ENTER COMPETITION] →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
