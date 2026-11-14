import PageShell from "@/components/layout/PageShell";
import { ActionLink, Badge, Panel } from "@/components/ui/primitives";
import Reveal from "@/components/ui/Reveal";
import { createClient } from "../../utils/supabase/server";
import { getAuthData } from "../../utils/auth/getAuthData";
import { getLiveCtfEvent } from "../../utils/events/ctf";
import { getVisibleEvents } from "../../utils/events/visible";
import {
  DEFAULT_TIME_ZONE,
  formatDateTime,
} from "../../utils/events/format";

export const revalidate = 60;

const discordServerId = process.env.NEXT_PUBLIC_DISCORD_SERVER_ID;
const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE;

export default async function Home() {
  const supabase = await createClient();

  const now = new Date().toISOString();
  const [
    { user, profile },
    { data: liveCtfEvent },
    { data: events, error: eventsError },
  ] = await Promise.all([
    getAuthData(),
    getLiveCtfEvent(supabase, now),
    getVisibleEvents(supabase, now),
  ]);

  const featuredEvent = eventsError ? null : (events?.[0] ?? null);
  const nowMs = Date.parse(now);
  const isLive =
    Boolean(featuredEvent?.ends_at) &&
    Date.parse(featuredEvent.starts_at) <= nowMs &&
    nowMs <= Date.parse(featuredEvent.ends_at);
  const ctfHref =
    liveCtfEvent && liveCtfEvent.id === featuredEvent?.id
      ? `/ctf/${liveCtfEvent.ctf_competition_id}`
      : "/ctf";

  const displayName = profile?.username || "hacker";

  return (
    <PageShell user={user} profile={profile} currentPath="/">
      <section className="lab-hero">
        <Reveal className="lab-hero-copy">
          <h1>
            Stay curious.
            <br />
            <em>Stay secure.</em>
          </h1>
          <p className="lab-greeting">
            Hello {displayName}! <span aria-hidden="true">~/welcome.sh</span>
          </p>
          <p>
            LSU&apos;s cybersecurity club since 2017. We run hands-on workshops,
            compete in CTFs, and connect students with industry professionals.
          </p>
          <div className="lab-actions">
            {discordInvite ? (
              <>
                <ActionLink
                  href={discordInvite}
                  target="_blank"
                  rel="noreferrer"
                >
                  Join Discord <span aria-hidden="true">↗</span>
                </ActionLink>
                <ActionLink href="/ctf" variant="secondary">
                  View CTFs
                </ActionLink>
              </>
            ) : (
              <ActionLink href="/ctf">View CTFs</ActionLink>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="lab-instrument" aria-hidden="true">
            <div className="lab-instrument-grid" />
            <div className="lab-instrument-top">
              <span>SSL / SECURITY LAB</span>
            </div>
            <div className="lab-orbit">
              <div className="lab-orbit-sweep" />
              <div className="lab-orbit-label">
                SSL<small>LEARN · BUILD · DEFEND</small>
              </div>
            </div>
            <div className="lab-instrument-bottom">
              <span>BATON ROUGE, LA</span>
              <span>30.41° N / 91.18° W</span>
            </div>
          </div>
        </Reveal>
      </section>
      <div className="lab-meeting-strip">
        <div>
          <span className="lab-eyebrow">Weekly meetings</span>
          <p>Fridays / 6:00–7:30 PM</p>
        </div>
        <div>
          <span className="lab-eyebrow">Find us</span>
          <p>PFT 1225</p>
        </div>
        <div>
          <span className="lab-eyebrow">Get in touch</span>
          <p>
            <a href="mailto:securitysocietylsu@protonmail.com">
              securitysocietylsu@protonmail.com
            </a>
          </p>
        </div>
      </div>
      {featuredEvent && (
        <Panel
          as="aside"
          aria-label="Featured event"
          className={isLive ? "lab-featured lab-live" : "lab-featured"}
        >
          <div>
            <Badge tone={isLive ? "active" : "gold"}>
              {isLive ? "Happening now" : "Next event"}
            </Badge>
            <h2>{featuredEvent.title}</h2>
            {isLive ? (
              featuredEvent.location && (
                <p className="lab-muted">{featuredEvent.location}</p>
              )
            ) : (
              <>
                <p className="lab-muted">
                  {formatDateTime(
                    featuredEvent.starts_at,
                    featuredEvent.timezone || DEFAULT_TIME_ZONE,
                  )}
                </p>
                {featuredEvent.location && (
                  <p className="lab-muted">{featuredEvent.location}</p>
                )}
              </>
            )}
          </div>
          {isLive ? (
            <ActionLink href={ctfHref}>
              Open CTF <span aria-hidden="true">↗</span>
            </ActionLink>
          ) : (
            <ActionLink href="/events" variant="secondary">
              All events <span aria-hidden="true">→</span>
            </ActionLink>
          )}
        </Panel>
      )}
      {discordServerId && (
        <Panel aria-labelledby="discord-heading" className="lab-discord">
          <h2 id="discord-heading">Join our Discord</h2>
          <iframe
            title="Discord server preview"
            src={`https://discord.com/widget?id=${discordServerId}&theme=dark`}
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            loading="lazy"
          />
        </Panel>
      )}
    </PageShell>
  );
}
