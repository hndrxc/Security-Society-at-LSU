// src/app/admin/page.jsx
import Link from "next/link";
import { createClient } from "../../../utils/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get competition stats
  const { count: totalCompetitions } = await supabase
    .from("ctf_competitions")
    .select("*", { count: "exact", head: true });

  const { count: activeCompetitions } = await supabase
    .from("ctf_competitions")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Get challenge count
  const { count: totalChallenges } = await supabase
    .from("ctf_challenges")
    .select("*", { count: "exact", head: true });

  // Get submission stats
  const { count: totalSubmissions } = await supabase
    .from("ctf_submissions")
    .select("*", { count: "exact", head: true });

  const { count: correctSubmissions } = await supabase
    .from("ctf_submissions")
    .select("*", { count: "exact", head: true })
    .eq("is_correct", true);

  // Get recent submissions
  const { data: recentSubmissions } = await supabase
    .from("ctf_submissions")
    .select(`
      id,
      submitted_at,
      is_correct,
      challenge_id,
      ctf_challenges (title)
    `)
    .order("submitted_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Overview of CTF system statistics and recent activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="clip-cyber border border-purple-900/50 bg-black/60 p-4">
          <div className="font-terminal text-xs text-slate-500">COMPETITIONS</div>
          <div className="mt-2 text-3xl font-semibold text-white">{totalCompetitions || 0}</div>
          <div className="mt-1 font-terminal text-xs text-[#39ff14]">
            {activeCompetitions || 0} active
          </div>
        </div>

        <div className="clip-cyber border border-purple-900/50 bg-black/60 p-4">
          <div className="font-terminal text-xs text-slate-500">CHALLENGES</div>
          <div className="mt-2 text-3xl font-semibold text-white">{totalChallenges || 0}</div>
          <div className="mt-1 font-terminal text-xs text-purple-400">
            across all competitions
          </div>
        </div>

        <div className="clip-cyber border border-purple-900/50 bg-black/60 p-4">
          <div className="font-terminal text-xs text-slate-500">SUBMISSIONS</div>
          <div className="mt-2 text-3xl font-semibold text-white">{totalSubmissions || 0}</div>
          <div className="mt-1 font-terminal text-xs text-amber-400">
            {correctSubmissions || 0} correct
          </div>
        </div>

        <div className="clip-cyber border border-purple-900/50 bg-black/60 p-4">
          <div className="font-terminal text-xs text-slate-500">SUCCESS RATE</div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {totalSubmissions ? Math.round((correctSubmissions / totalSubmissions) * 100) : 0}%
          </div>
          <div className="mt-1 font-terminal text-xs text-slate-500">
            correct submissions
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/ctf/competitions/new"
          className="flex items-center gap-4 clip-cyber border border-amber-500/30 bg-amber-500/10 p-4 transition-colors hover:bg-amber-500/20"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20 text-2xl">
            +
          </div>
          <div>
            <div className="font-semibold text-amber-200">Create Competition</div>
            <div className="text-sm text-slate-400">Set up a new CTF event</div>
          </div>
        </Link>

        <Link
          href="/admin/ctf/competitions"
          className="flex items-center gap-4 clip-cyber border border-purple-500/30 bg-purple-500/10 p-4 transition-colors hover:bg-purple-500/20"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20 font-terminal text-lg">
            []
          </div>
          <div>
            <div className="font-semibold text-purple-200">Manage Competitions</div>
            <div className="text-sm text-slate-400">Edit or add challenges</div>
          </div>
        </Link>

        <Link
          href="/admin/ctf/submissions"
          className="flex items-center gap-4 clip-cyber border border-slate-500/30 bg-slate-500/10 p-4 transition-colors hover:bg-slate-500/20"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-500/20 font-terminal text-lg">
            {">>"}
          </div>
          <div>
            <div className="font-semibold text-slate-200">View Submissions</div>
            <div className="text-sm text-slate-400">Review flag attempts</div>
          </div>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="clip-cyber border border-purple-900/50 bg-black/60 p-6">
        <h2 className="mb-4 font-terminal text-sm uppercase text-amber-300">
          [RECENT SUBMISSIONS]
        </h2>
        {recentSubmissions?.length ? (
          <div className="space-y-2">
            {recentSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded border border-purple-900/30 bg-black/40 px-4 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-terminal text-xs ${sub.is_correct ? 'text-[#39ff14]' : 'text-rose-400'}`}>
                    [{sub.is_correct ? 'CORRECT' : 'WRONG'}]
                  </span>
                  <span className="text-sm text-slate-300">
                    {sub.ctf_challenges?.title || 'Unknown Challenge'}
                  </span>
                </div>
                <span className="font-terminal text-xs text-slate-500">
                  {new Date(sub.submitted_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No submissions yet.</p>
        )}
      </div>
    </div>
  );
}
