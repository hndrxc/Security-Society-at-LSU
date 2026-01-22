// src/app/ctf/[competitionId]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChallengeCard from "@/components/ctf/ChallengeCard";
import LeaderboardTable from "@/components/ctf/LeaderboardTable";
import { createClient } from "../../../../utils/supabase/server";
import { getAuthData } from "../../../../utils/auth/getAuthData";
import { getUserChallengeStatus } from "../actions";

export const revalidate = 30;

export default async function CompetitionPage({ params }) {
  const { competitionId } = await params;
  const supabase = await createClient();
  const { user, profile } = await getAuthData();

  // Fetch competition
  const { data: competition, error: compError } = await supabase
    .from("ctf_competitions")
    .select("*")
    .eq("id", competitionId)
    .eq("is_active", true)
    .single();

  if (compError || !competition) {
    notFound();
  }

  // Fetch challenges
  const { data: challenges } = await supabase
    .from("ctf_challenges")
    .select("*")
    .eq("competition_id", competitionId)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("points", { ascending: true });

  // Fetch leaderboard
  const { data: leaderboard } = await supabase.rpc("get_competition_leaderboard", {
    p_competition_id: competitionId,
    p_limit: 10,
  });

  // Get user's solve status
  const { solvedChallenges, unlockedHints } = await getUserChallengeStatus(competitionId);

  const solvedMap = new Map(solvedChallenges.map((s) => [s.challenge_id, s]));
  const hintMap = unlockedHints.reduce((acc, h) => {
    if (!acc[h.challenge_id]) acc[h.challenge_id] = [];
    acc[h.challenge_id].push(h);
    return acc;
  }, {});

  // Group challenges by category
  const categorizedChallenges = (challenges || []).reduce((acc, ch) => {
    const cat = ch.category || "misc";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ch);
    return acc;
  }, {});

  const categories = Object.keys(categorizedChallenges).sort();

  // Competition status
  const now = new Date();
  const startTime = new Date(competition.starts_at);
  const endTime = new Date(competition.ends_at);
  const isActive = now >= startTime && now <= endTime;
  const hasStarted = now >= startTime;
  const hasEnded = now > endTime;

  const totalPoints = challenges?.reduce((sum, ch) => sum + ch.points, 0) || 0;
  const userPoints = solvedChallenges.reduce((sum, s) => sum + s.points_awarded, 0);

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

      <Navbar user={user} profile={profile} currentPath="/ctf" maxWidth="6xl" />

      <main className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16">
        {/* Back link */}
        <div className="mb-4">
          <Link
            href="/ctf"
            className="font-terminal text-xs text-purple-400 hover:text-amber-300"
          >
            ← Back to Competitions
          </Link>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main content */}
          <div className="flex-1">
            <section className="relative clip-cyber-reverse border-l-4 border-l-amber-400 border border-purple-900/50 bg-[#0f0d16]/80 p-6 shadow-2xl shadow-purple-900/40 backdrop-blur sm:p-8">
              <div className="scanline-overlay pointer-events-none absolute inset-0 opacity-30" />

              {/* Competition header */}
              <div className="relative mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-terminal mb-1 text-xs">
                    <span className={`${isActive ? 'text-[#39ff14]' : hasEnded ? 'text-slate-500' : 'text-amber-400'}`}>
                      [{isActive ? 'ACTIVE' : hasEnded ? 'ENDED' : 'UPCOMING'}]
                    </span>
                  </div>
                  <h1 className="rgb-hover text-2xl font-semibold text-white sm:text-3xl">
                    {competition.title}
                  </h1>
                  {competition.description && (
                    <p className="mt-2 text-sm text-slate-300">{competition.description}</p>
                  )}
                </div>
                <div className="font-terminal text-right text-xs">
                  <div className="text-slate-500">
                    START: {startTime.toLocaleString()}
                  </div>
                  <div className="text-slate-500">
                    END: {endTime.toLocaleString()}
                  </div>
                  <div className="mt-2 text-amber-300">
                    {challenges?.length || 0} CHALLENGES | {totalPoints} PTS
                  </div>
                </div>
              </div>

              {/* User progress */}
              {user && (
                <div className="relative mb-6 clip-cyber border border-purple-500/30 bg-purple-500/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 font-terminal text-sm">
                    <div>
                      <span className="text-slate-500">YOUR PROGRESS:</span>
                      <span className="ml-2 text-[#39ff14]">
                        {solvedChallenges.length}/{challenges?.length || 0} solved
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">YOUR POINTS:</span>
                      <span className="ml-2 text-amber-300">{userPoints}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Login prompt */}
              {!user && (
                <div className="relative mb-6 clip-cyber border border-amber-400/50 bg-amber-500/10 p-4">
                  <p className="font-terminal text-sm text-amber-200">
                    <span className="text-amber-400">[INFO]</span>
                    <Link href="/login" className="ml-2 underline hover:text-amber-100">
                      Log in
                    </Link>
                    {" "}to submit flags and track your progress.
                  </p>
                </div>
              )}

              {/* Competition rules */}
              {competition.rules && (
                <div className="relative mb-6 clip-cyber border border-slate-600/30 bg-slate-800/30 p-4">
                  <div className="font-terminal mb-2 text-xs text-slate-500">RULES:</div>
                  <p className="whitespace-pre-wrap text-sm text-slate-300">
                    {competition.rules}
                  </p>
                </div>
              )}

              {/* Challenges by category */}
              {!hasStarted ? (
                <div className="clip-cyber border border-purple-900/50 bg-black/50 p-8 text-center">
                  <div className="font-terminal mb-4 text-4xl text-purple-500/40">[LOCKED]</div>
                  <p className="font-terminal text-amber-300">COMPETITION STARTS:</p>
                  <p className="mt-2 text-lg text-white">{startTime.toLocaleString()}</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="clip-cyber border border-purple-900/50 bg-black/50 p-8 text-center">
                  <div className="font-terminal mb-4 text-4xl text-purple-500/40">[NO DATA]</div>
                  <p className="font-terminal text-slate-400">No challenges available yet.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {categories.map((category) => (
                    <div key={category}>
                      <h2 className="font-terminal mb-4 flex items-center gap-2 text-lg uppercase text-purple-400">
                        <span className="h-px flex-1 bg-purple-900/50" />
                        <span>{category}</span>
                        <span className="h-px flex-1 bg-purple-900/50" />
                      </h2>
                      <div className="grid gap-4">
                        {categorizedChallenges[category].map((challenge) => (
                          <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            isSolved={solvedMap.has(challenge.id)}
                            solveInfo={solvedMap.get(challenge.id)}
                            unlockedHints={hintMap[challenge.id] || []}
                            isLoggedIn={!!user}
                            competitionActive={isActive}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="w-full lg:w-80">
            <div className="sticky top-6 clip-cyber border border-purple-900/50 bg-[#0f0d16]/80 p-4 shadow-xl shadow-purple-900/30 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-terminal text-sm uppercase text-amber-300">
                  [LEADERBOARD]
                </h2>
                <Link
                  href={`/ctf/${competitionId}/leaderboard`}
                  className="font-terminal text-xs text-purple-400 hover:text-amber-300"
                >
                  View All →
                </Link>
              </div>
              <LeaderboardTable
                entries={leaderboard}
                currentUserId={user?.id}
                limit={10}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
