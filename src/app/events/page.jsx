import Image from "next/image";
import PageShell from "@/components/layout/PageShell";
import {
  ActionLink,
  Feedback,
  PageHeading,
  Panel,
} from "@/components/ui/primitives";
import Reveal from "@/components/ui/Reveal";
import { createClient } from "../../../utils/supabase/server";
import { getAuthData } from "../../../utils/auth/getAuthData";
import { getVisibleEvents } from "../../../utils/events/visible";
import {
  DEFAULT_TIME_ZONE,
  formatDateTime,
} from "../../../utils/events/format";
import styles from "./events.module.css";

export const revalidate = 60;

export const metadata = {
  title: "Events | Security Society at LSU",
  description: "Upcoming Security Society at LSU events.",
};

export default async function EventsPage() {
  const supabase = await createClient();
  const now = new Date();
  const nowIso = now.toISOString();

  const [auth, eventsResult, competitionsResult] = await Promise.all([
    getAuthData(),
    getVisibleEvents(supabase, nowIso),
    supabase.from("ctf_competitions").select("id,title").eq("is_active", true),
  ]);

  const { user, profile } = auth;
  const { data: events, error: eventsError } = eventsResult;
  const { data: competitions } = competitionsResult;
  const competitionsById = new Map(
    (competitions || []).map((competition) => [competition.id, competition]),
  );
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <PageShell user={user} profile={profile} currentPath="/events" className={styles.page}>
      <PageHeading title="Upcoming Events" />
      {eventsError && <Feedback tone="error">Unable to load events</Feedback>}
      {!events?.length && !eventsError && (
        <Panel>
          <p className="lab-muted">No upcoming events. Check back soon.</p>
        </Panel>
      )}
      <div className="lab-timeline">
        {events?.map((event, index) => (
          <Reveal key={event.id} delay={index * 0.04}>
            <article className="lab-event">
              <div className="lab-event-date">
                <span>
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    timeZone: event.timezone || DEFAULT_TIME_ZONE,
                  }).format(new Date(event.starts_at))}
                </span>
                <strong>
                  {new Intl.DateTimeFormat("en-US", {
                    day: "2-digit",
                    timeZone: event.timezone || DEFAULT_TIME_ZONE,
                  }).format(new Date(event.starts_at))}
                </strong>
                <span>
                  {new Intl.DateTimeFormat("en-US", {
                    weekday: "short",
                    timeZone: event.timezone || DEFAULT_TIME_ZONE,
                  }).format(new Date(event.starts_at))}
                </span>
              </div>
              <Panel as="div" className="lab-event-body">
                {event.image_path && supabaseUrl && (
                  <div className="relative aspect-[21/9]">
                    <Image
                      src={`${supabaseUrl}/storage/v1/object/public/event-media/${event.image_path}`}
                      alt=""
                      fill
                      sizes="(min-width: 1200px) 980px, (min-width: 760px) calc(100vw - 200px), calc(100vw - 120px)"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="lab-event-content">
                  <h3>{event.title}</h3>
                  <div className="lab-event-meta">
                    {event.location && <span>{event.location}</span>}
                    <span>
                      START:{" "}
                      {formatDateTime(
                        event.starts_at,
                        event.timezone || DEFAULT_TIME_ZONE,
                      )}
                    </span>
                    {event.ends_at && (
                      <span>
                        END:{" "}
                        {formatDateTime(
                          event.ends_at,
                          event.timezone || DEFAULT_TIME_ZONE,
                        )}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="lab-muted text-sm">{event.description}</p>
                  )}
                  {competitionsById.has(event.ctf_competition_id) && (
                    <ActionLink
                      href={`/ctf/${event.ctf_competition_id}`}
                      variant="secondary"
                      className="mt-5"
                    >
                      View CTF:{" "}
                      {competitionsById.get(event.ctf_competition_id).title} ↗
                    </ActionLink>
                  )}
                </div>
              </Panel>
            </article>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
