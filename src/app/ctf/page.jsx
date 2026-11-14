import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import {
  Badge,
  Feedback,
  PageHeading,
  Panel,
} from "@/components/ui/primitives";
import Reveal from "@/components/ui/Reveal";
import TransitionRegion from "@/components/ui/TransitionRegion";
import { createClient } from "../../../utils/supabase/server";
import { getAuthData } from "../../../utils/auth/getAuthData";
import { formatDateTime } from "../../../utils/events/format";
import styles from "./ctf.module.css";

export const revalidate = 60;

export const metadata = {
  title: "CTF | Security Society at LSU",
  description: "Security Society at LSU capture-the-flag competitions.",
};

function getCompetitionStatus(competition, now) {
  const start = new Date(competition.starts_at);
  const end = new Date(competition.ends_at);

  if (now < start) return "UPCOMING";
  if (now > end) return "ENDED";
  return "ACTIVE";
}

function countByCompetition(rows) {
  return (rows || []).reduce((counts, row) => {
    counts[row.competition_id] = (counts[row.competition_id] || 0) + 1;
    return counts;
  }, {});
}

export default async function CTFPage() {
  const supabase = await createClient();
  const now = new Date();

  const [auth, competitionsResult] = await Promise.all([
    getAuthData(),
    supabase
      .from("ctf_competitions")
      .select("id,title,description,starts_at,ends_at,is_active")
      .eq("is_active", true)
      .order("starts_at", { ascending: true }),
  ]);

  const { user, profile } = auth;
  const { data: competitions, error: competitionsError } = competitionsResult;
  const competitionIds = (competitions || []).map(
    (competition) => competition.id,
  );

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

  return (
    <PageShell
      user={user}
      profile={profile}
      currentPath="/ctf"
      className={styles.page}
    >
      <PageHeading title="CTF Competitions" />
      {!user && (
        <Feedback className="mb-6">
          <Link href="/login" prefetch={false} className="underline">
            Log in
          </Link>{" "}
          to submit flags and track your progress.
        </Feedback>
      )}
      {competitionsError && (
        <Feedback tone="error">Unable to load competitions</Feedback>
      )}
      {!competitions?.length && !competitionsError && (
        <Panel>
          <p className="lab-muted">No active competitions. Check back soon.</p>
        </Panel>
      )}
      <div className="lab-competition-grid">
        {competitions?.map((competition, index) => {
          const status = getCompetitionStatus(competition, now);
          return (
            <Reveal key={competition.id} delay={index * 0.06}>
              <Link
                href={`/ctf/${competition.id}`}
                className="lab-panel lab-competition-card"
              >
                <div className="lab-card-top">
                  <Badge
                    tone={
                      status === "ACTIVE"
                        ? "active"
                        : status === "UPCOMING"
                          ? "gold"
                          : "neutral"
                    }
                  >
                    {status}
                  </Badge>
                </div>
                <TransitionRegion
                  name={`competition-${competition.id}`}
                  kind="lab-shared"
                >
                  <h3>{competition.title}</h3>
                </TransitionRegion>
                {competition.description && (
                  <p className="lab-muted text-sm line-clamp-2">
                    {competition.description}
                  </p>
                )}
                <div className="lab-muted font-terminal text-xs leading-6">
                  <p>START: {formatDateTime(competition.starts_at)}</p>
                  <p>END: {formatDateTime(competition.ends_at)}</p>
                </div>
                <div className="lab-card-bottom">
                  <span>
                    {challengeCounts[competition.id] || 0} challenges
                    {user ? ` · ${userSolves[competition.id] || 0} solved` : ""}
                  </span>
                  <span className="text-amber-300">Enter competition ↗</span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </PageShell>
  );
}
