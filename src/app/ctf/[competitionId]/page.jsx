// src/app/ctf/[competitionId]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import {
  ActionLink,
  Badge,
  Breadcrumbs,
  Feedback,
  PageHeading,
  Panel,
} from "@/components/ui/primitives";
import ChallengeBrowser from "@/components/ctf/ChallengeBrowser";
import LeaderboardTable from "@/components/ctf/LeaderboardTable";
import { createClient } from "../../../../utils/supabase/server";
import { getAuthData } from "../../../../utils/auth/getAuthData";
import { getUserChallengeStatus } from "../actions";

export const revalidate = 30;

export default async function CompetitionPage({ params }) {
  const { competitionId } = await params;
  const supabase = await createClient();
  const [{ user, profile }, { data: competition, error: compError }] = await Promise.all([
    getAuthData(),
    supabase
      .from("ctf_competitions")
      .select("id,title,description,rules,starts_at,ends_at")
      .eq("id", competitionId)
      .eq("is_active", true)
      .single(),
  ]);

  if (compError || !competition) {
    notFound();
  }

  const [
    { data: challenges },
    { data: leaderboard },
    { solvedChallenges, unlockedHints },
  ] = await Promise.all([
    supabase
      .from("ctf_challenges")
      .select("id,title,description,category,difficulty,points,flag_format,challenge_url,attachment_url,hint_1,hint_1_cost,hint_2,hint_2_cost,hint_3,hint_3_cost")
      .eq("competition_id", competitionId)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })
      .order("points", { ascending: true }),
    supabase.rpc(
      "get_competition_leaderboard",
      { p_competition_id: competitionId, p_limit: 10 },
    ),
    getUserChallengeStatus(competitionId),
  ]);

  // Competition status
  const now = new Date();
  const startTime = new Date(competition.starts_at);
  const endTime = new Date(competition.ends_at);
  const isActive = now >= startTime && now <= endTime;
  const hasStarted = now >= startTime;
  const hasEnded = now > endTime;

  const totalPoints = challenges?.reduce((sum, ch) => sum + ch.points, 0) || 0;
  const userPoints = solvedChallenges.reduce(
    (sum, s) => sum + s.points_awarded,
    0,
  );

  return (
    <PageShell user={user} profile={profile} currentPath="/ctf" wide>
      <Breadcrumbs
        items={[
          { label: "Events", href: "/events#ctf" },
          { label: competition.title },
        ]}
      />
      <PageHeading
        eyebrow="CTF / Competition workspace"
        title={competition.title}
        transitionName={`competition-${competitionId}`}
        description={competition.description}
      >
        <Badge tone={isActive ? "active" : hasEnded ? "neutral" : "gold"}>
          {isActive ? "Active" : hasEnded ? "Ended" : "Upcoming"}
        </Badge>
      </PageHeading>
      <div className="lab-summary">
        <span>
          <strong>{challenges?.length || 0}</strong> challenges
        </span>
        <span>
          <strong>{totalPoints}</strong> possible points
        </span>
        <span>START: {startTime.toLocaleString()}</span>
        <span>END: {endTime.toLocaleString()}</span>
      </div>
      <div className="lab-workspace">
        <div className="min-w-0">
          {user ? (
            <Panel className="mb-6">
              <div className="lab-card-top">
                <div>
                  <p className="lab-eyebrow">Your progress</p>
                  <p className="mt-2">
                    {solvedChallenges.length}/{challenges?.length || 0} solved
                  </p>
                </div>
                <strong className="text-amber-300 text-2xl">
                  {userPoints} <span className="text-sm">pts</span>
                </strong>
              </div>
              <progress
                className="lab-progress mt-5 w-full h-1"
                value={solvedChallenges.length}
                max={challenges?.length || 1}
                aria-label="Challenges solved"
              />
            </Panel>
          ) : (
            <Feedback className="mb-6">
              <Link className="underline" href="/login" prefetch={false}>
                Log in
              </Link>{" "}
              to submit flags and track your progress.
            </Feedback>
          )}
          {competition.rules && (
            <Panel className="mb-6">
              <p className="lab-eyebrow mb-3">Rules</p>
              <p className="whitespace-pre-wrap lab-muted text-sm">
                {competition.rules}
              </p>
            </Panel>
          )}
          {!hasStarted ? (
            <Panel>
              <Badge tone="gold">Locked</Badge>
              <p className="mt-4">
                Competition starts: {startTime.toLocaleString()}
              </p>
            </Panel>
          ) : !challenges?.length ? (
            <Panel>
              <p className="lab-muted">No challenges available yet.</p>
            </Panel>
          ) : (
            <ChallengeBrowser
              key={`${competitionId}:${user?.id || "guest"}`}
              challenges={challenges}
              solvedChallenges={solvedChallenges}
              unlockedHints={unlockedHints}
              isLoggedIn={!!user}
              competitionActive={isActive}
            />
          )}
        </div>
        <aside>
          <Panel>
            <div className="lab-card-top mb-6">
              <h2 className="lab-eyebrow">Leaderboard</h2>
              <ActionLink
                href={`/ctf/${competitionId}/leaderboard`}
                variant="secondary"
              >
                View All ↗
              </ActionLink>
            </div>
            <LeaderboardTable
              entries={leaderboard}
              currentUserId={user?.id}
              limit={10}
            />
          </Panel>
        </aside>
      </div>
    </PageShell>
  );
}
