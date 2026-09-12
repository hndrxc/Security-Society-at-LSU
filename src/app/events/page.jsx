import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { ActionLink, Badge, Feedback, PageHeading, Panel } from "@/components/ui/primitives";
import Reveal from "@/components/ui/Reveal";
import { createClient } from "../../../utils/supabase/server";
import { getAuthData } from "../../../utils/auth/getAuthData";

export const revalidate = 60;

export const metadata = {
  title: "Events & CTF | Security Society at LSU",
  description: "Upcoming Security Society events and active CTF competitions.",
};

const DEFAULT_TIME_ZONE = "America/Chicago";
const EVENT_BASE_COLUMNS = ["id", "title", "description", "starts_at", "ends_at", "location"];
const EVENT_OPTIONAL_COLUMNS = ["timezone", "image_path", "ctf_competition_id"];

function isMissingColumn(error, column) {
  return Boolean(
    error &&
      (error.code === "42703" || error.code === "PGRST204") &&
      error.message?.includes(column),
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
  const availableOptionalColumns = new Set(EVENT_OPTIONAL_COLUMNS);
  let result;

  // Migrations 009–011 add the optional display fields. Keep listings
  // available while an environment is upgraded instead of failing all events.
  for (let attempt = 0; attempt <= EVENT_OPTIONAL_COLUMNS.length; attempt += 1) {
    const columns = [...EVENT_BASE_COLUMNS, ...availableOptionalColumns].join(",");
    result = await createVisibleEventsQuery(supabase, now, columns);

    const missingColumn = EVENT_OPTIONAL_COLUMNS.find(
      (column) => availableOptionalColumns.has(column) && isMissingColumn(result.error, column),
    );

    if (!missingColumn) return result;
    availableOptionalColumns.delete(missingColumn);
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
  const competitionsById = new Map((competitions || []).map((competition) => [competition.id, competition]));
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

  return <PageShell user={user} profile={profile} currentPath="/events">
    <PageHeading eyebrow="01 / Operations hub" title="Upcoming Operations" description="Find our latest meetups, workshops, and CTF competitions in one place."><Badge>{events?.length || 0} Events · {competitions?.length || 0} CTFs</Badge></PageHeading>
    <nav className="lab-section-nav" aria-label="Operations sections"><ActionLink href="#events" variant="secondary">Club Events ↓</ActionLink><ActionLink href="#ctf" variant="secondary">CTF Competitions ↓</ActionLink></nav>
    <section id="events"><div className="lab-section-title"><div><p className="lab-eyebrow">Calendar / Get involved</p><h2>Club Events</h2></div><span className="lab-eyebrow">{events?.length || 0} Scheduled</span></div>
      {eventsError && <Feedback tone="error">Unable to load events</Feedback>}
      {!events?.length && !eventsError && <Panel><p className="lab-eyebrow">Awaiting mission briefing</p><p className="lab-muted mt-3">Check back soon for upcoming club events.</p></Panel>}
      <div className="lab-timeline">{events?.map((event, index) => <Reveal key={event.id} delay={index * 0.04}><article className="lab-event"><div className="lab-event-date"><span>{new Intl.DateTimeFormat('en-US', { month:'short', timeZone: event.timezone || DEFAULT_TIME_ZONE }).format(new Date(event.starts_at))}</span><strong>{new Intl.DateTimeFormat('en-US', { day:'2-digit', timeZone: event.timezone || DEFAULT_TIME_ZONE }).format(new Date(event.starts_at))}</strong><span>{new Intl.DateTimeFormat('en-US', { weekday:'short', timeZone: event.timezone || DEFAULT_TIME_ZONE }).format(new Date(event.starts_at))}</span></div>
        <Panel as="div" className="lab-event-body">{event.image_path && supabaseUrl && <div className="relative aspect-[21/9]"><Image src={`${supabaseUrl}/storage/v1/object/public/event-media/${event.image_path}`} alt="" fill sizes="(min-width: 1200px) 980px, (min-width: 760px) calc(100vw - 200px), calc(100vw - 120px)" className="object-cover" unoptimized /></div>}
          <div className="lab-event-content"><h3>{event.title}</h3><div className="lab-event-meta">{event.location && <span>{event.location}</span>}<span>START: {formatDate(event.starts_at, event.timezone || DEFAULT_TIME_ZONE)}</span>{event.ends_at && <span>END: {formatDate(event.ends_at, event.timezone || DEFAULT_TIME_ZONE)}</span>}</div>{event.description && <p className="lab-muted text-sm">{event.description}</p>}{competitionsById.has(event.ctf_competition_id) && <ActionLink href={`/ctf/${event.ctf_competition_id}`} variant="secondary" className="mt-5">View CTF: {competitionsById.get(event.ctf_competition_id).title} ↗</ActionLink>}</div>
        </Panel></article></Reveal>)}</div>
    </section>
    <section id="ctf"><div className="lab-section-title"><div><p className="lab-eyebrow">Competition / Put your skills to work</p><h2>CTF Competitions</h2><p className="lab-muted mt-3 text-sm">Capture flags, solve challenges, and climb the leaderboard.</p></div><span className="lab-eyebrow">{competitions?.length || 0} Available</span></div>
      {!user && <Feedback className="mb-6"><Link href="/login" className="underline">Log in</Link> to submit flags and track your progress.</Feedback>}
      {competitionsError && <Feedback tone="error">Unable to load competitions</Feedback>}
      {!competitions?.length && !competitionsError && <Panel><p className="lab-eyebrow">No active competitions</p><p className="lab-muted mt-3">Check back soon for upcoming CTF events.</p></Panel>}
      <div className="lab-competition-grid">{competitions?.map((competition, index) => {const status=getCompetitionStatus(competition, now);return <Reveal key={competition.id} delay={index * 0.06}><Link href={`/ctf/${competition.id}`} className="lab-panel lab-competition-card"><div className="lab-card-top"><Badge tone={status.label === 'ACTIVE' ? 'active' : status.label === 'UPCOMING' ? 'gold' : 'neutral'}>{status.label}</Badge><span className="lab-eyebrow">CTF / {String(index+1).padStart(2,'0')}</span></div><h3>{competition.title}</h3>{competition.description && <p className="lab-muted text-sm line-clamp-2">{competition.description}</p>}<div className="lab-muted font-terminal text-xs leading-6"><p>START: {formatDate(competition.starts_at)}</p><p>END: {formatDate(competition.ends_at)}</p></div><div className="lab-card-bottom"><span>{challengeCounts[competition.id] || 0} challenges{user ? ` · ${userSolves[competition.id] || 0} solved` : ''}</span><span className="text-amber-300">Enter competition ↗</span></div></Link></Reveal>;})}</div>
    </section>
  </PageShell>;
}
