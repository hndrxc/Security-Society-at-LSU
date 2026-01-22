// src/app/ctf/[competitionId]/leaderboard/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import LogoBadge from "@/components/LogoBadge";
import { createClient } from "../../../../../utils/supabase/server";

export const revalidate = 30;

export default async function LeaderboardPage({ params }) {
  const { competitionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const accountHref = user ? "/account" : "/login";
  const accountLabel = user ? "Account" : "Login";

  // Fetch competition
  const { data: competition, error: compError } = await supabase
    .from("ctf_competitions")
    .select("id, title, starts_at, ends_at")
    .eq("id", competitionId)
    .eq("is_active", true)
    .single();

  if (compError || !competition) {
    notFound();
  }

  // Fetch full leaderboard
  const { data: leaderboard } = await supabase.rpc("get_competition_leaderboard", {
    p_competition_id: competitionId,
    p_limit: 100,
  });

  // Get challenge count
  const { count: challengeCount } = await supabase
    .from("ctf_challenges")
    .select("*", { count: "exact", head: true })
    .eq("competition_id", competitionId)
    .eq("is_visible", true);

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

      <header className="relative mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-8">
        <div className="absolute bottom-0 left-4 right-4 h-px border-animate sm:left-6 sm:right-6" />

        <div className="flex items-center gap-3 sm:gap-4">
          <LogoBadge size={48} className="shrink-0" priority />
          <div className="text-center sm:text-left">
            <p className="font-terminal text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Security Society at LSU
            </p>
            <p className="text-base font-semibold text-slate-100">LSU&apos;s Best Cybersecurity Club</p>
          </div>
        </div>

        <nav className="flex w-full flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-200 sm:w-auto sm:justify-end">
          <Link
            href="/"
            className="glitch-hover font-terminal rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-colors hover:bg-purple-700/40 hover:text-amber-200"
          >
            Home
          </Link>
          <Link
            href="/events"
            className="glitch-hover font-terminal rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-colors hover:bg-purple-700/40 hover:text-amber-200"
          >
            Events
          </Link>
          <Link
            href="/ctf"
            className="font-terminal rounded-full border border-purple-700/60 bg-purple-800/40 px-4 py-2 text-xs uppercase tracking-wider text-amber-200 shadow-sm shadow-purple-900/40"
          >
            CTF
          </Link>
          <Link
            href="/about"
            className="glitch-hover font-terminal rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-colors hover:bg-purple-700/40 hover:text-amber-200"
          >
            About
          </Link>
          <Link
            href={accountHref}
            className="pulse-glow rounded-full border border-amber-400/70 px-4 py-2 text-amber-200 transition-all hover:border-transparent hover:bg-amber-400 hover:text-black"
          >
            {accountLabel}
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6 sm:pb-16">
        {/* Back link */}
        <div className="mb-4">
          <Link
            href={`/ctf/${competitionId}`}
            className="font-terminal text-xs text-purple-400 hover:text-amber-300"
          >
            ← Back to {competition.title}
          </Link>
        </div>

        <section className="relative clip-cyber-reverse border-l-4 border-l-amber-400 border border-purple-900/50 bg-[#0f0d16]/80 p-6 shadow-2xl shadow-purple-900/40 backdrop-blur sm:p-8">
          <div className="scanline-overlay pointer-events-none absolute inset-0 opacity-30" />

          {/* Header */}
          <div className="relative mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="font-terminal mb-2 text-xs text-purple-400">
                <span className="text-amber-400">[SYS]</span>
                <span className="ml-2 text-slate-400">RANKINGS FOR: {competition.title}</span>
              </div>
              <p className="font-terminal text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">[RANKINGS]</p>
              <h1 className="text-glow-amber text-3xl font-semibold text-white sm:text-4xl">Leaderboard</h1>
            </div>
            <div className="font-terminal text-right text-xs">
              <div className="text-[#39ff14]">PARTICIPANTS: {leaderboard?.length || 0}</div>
              <div className="text-slate-500">CHALLENGES: {challengeCount || 0}</div>
            </div>
          </div>

          {/* Leaderboard table */}
          {!leaderboard?.length ? (
            <div className="clip-cyber border border-purple-900/50 bg-black/50 p-8 text-center shadow-lg shadow-purple-900/30">
              <div className="font-terminal mb-4 text-5xl text-purple-500/40">[NO DATA]</div>
              <p className="font-terminal text-amber-300">NO SOLVES YET...</p>
              <p className="mt-2 text-sm text-slate-500">Be the first to capture a flag!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-purple-900/50 font-terminal text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3 text-right">Points</th>
                    <th className="px-4 py-3 text-right">Solved</th>
                    <th className="hidden px-4 py-3 text-right sm:table-cell">Last Solve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30">
                  {leaderboard.map((entry) => {
                    const isCurrentUser = entry.user_id === user?.id;

                    // Rank styling
                    let rankContent;
                    if (entry.rank === 1) {
                      rankContent = <span className="text-2xl">🥇</span>;
                    } else if (entry.rank === 2) {
                      rankContent = <span className="text-2xl">🥈</span>;
                    } else if (entry.rank === 3) {
                      rankContent = <span className="text-2xl">🥉</span>;
                    } else {
                      rankContent = <span className="font-terminal text-slate-400">{entry.rank}</span>;
                    }

                    return (
                      <tr
                        key={entry.user_id}
                        className={`transition-colors ${
                          isCurrentUser
                            ? 'bg-purple-500/20'
                            : entry.rank <= 3
                            ? 'bg-amber-500/5'
                            : 'hover:bg-purple-500/10'
                        }`}
                      >
                        <td className="px-4 py-3 text-center">{rankContent}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className={`font-semibold ${
                              isCurrentUser ? 'text-amber-200' :
                              entry.rank <= 3 ? 'text-white' : 'text-slate-200'
                            }`}>
                              {entry.username || entry.full_name || 'Anonymous'}
                            </span>
                            {isCurrentUser && (
                              <span className="font-terminal text-xs text-purple-400">[YOU]</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-terminal text-lg text-amber-300">
                            {entry.total_points}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-terminal text-[#39ff14]">
                            {entry.challenges_solved}
                          </span>
                          <span className="text-slate-500">/{challengeCount}</span>
                        </td>
                        <td className="hidden px-4 py-3 text-right text-sm text-slate-400 sm:table-cell">
                          {new Date(entry.last_solve_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
