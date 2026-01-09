// src/app/admin/ctf/submissions/page.jsx
import { redirect } from "next/navigation";
import { createClient } from "../../../../../utils/supabase/server";

// Helper to verify admin authorization
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return supabase;
}

export default async function SubmissionsPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await requireAdmin();

  const filter = params.filter || 'all';
  const page = parseInt(params.page || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Build query - fetch submissions without profiles join (no direct FK relationship)
  let query = supabase
    .from("ctf_submissions")
    .select(`
      id,
      submitted_flag,
      is_correct,
      submitted_at,
      user_id,
      ctf_challenges (title, competition_id, ctf_competitions (title))
    `, { count: 'exact' })
    .order("submitted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter === 'correct') {
    query = query.eq('is_correct', true);
  } else if (filter === 'incorrect') {
    query = query.eq('is_correct', false);
  }

  const { data: submissions, count, error } = await query;

  if (error) {
    console.error('Submissions query error:', error);
  }

  // Fetch profiles separately and attach to submissions
  if (submissions?.length) {
    const userIds = [...new Set(submissions.map(s => s.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, full_name")
      .in("id", userIds);

    const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p]) || []);
    submissions.forEach(sub => {
      sub.profiles = profileMap[sub.user_id] || null;
    });
  }

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Submissions</h1>
          <p className="mt-1 text-sm text-slate-400">
            View and analyze all flag submission attempts.
          </p>
        </div>
        <div className="font-terminal text-sm text-slate-500">
          Total: {count || 0}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <a
          href="/admin/ctf/submissions"
          className={`rounded px-3 py-1.5 font-terminal text-xs transition-colors ${
            filter === 'all'
              ? 'bg-purple-500/30 text-purple-200'
              : 'bg-slate-700/30 text-slate-400 hover:bg-slate-600/30'
          }`}
        >
          All
        </a>
        <a
          href="/admin/ctf/submissions?filter=correct"
          className={`rounded px-3 py-1.5 font-terminal text-xs transition-colors ${
            filter === 'correct'
              ? 'bg-[#39ff14]/20 text-[#39ff14]'
              : 'bg-slate-700/30 text-slate-400 hover:bg-slate-600/30'
          }`}
        >
          Correct
        </a>
        <a
          href="/admin/ctf/submissions?filter=incorrect"
          className={`rounded px-3 py-1.5 font-terminal text-xs transition-colors ${
            filter === 'incorrect'
              ? 'bg-rose-500/20 text-rose-300'
              : 'bg-slate-700/30 text-slate-400 hover:bg-slate-600/30'
          }`}
        >
          Incorrect
        </a>
      </div>

      {/* Submissions table */}
      {!submissions?.length ? (
        <div className="clip-cyber border border-purple-900/50 bg-black/60 p-8 text-center">
          <div className="font-terminal mb-4 text-4xl text-purple-500/40">[NO DATA]</div>
          <p className="text-slate-400">No submissions found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-purple-900/50 font-terminal text-xs uppercase text-slate-500">
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Challenge</th>
                <th className="px-4 py-3">Competition</th>
                <th className="px-4 py-3">Submitted Flag</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-purple-500/5">
                  <td className="px-4 py-3">
                    <span className={`font-terminal text-xs ${
                      sub.is_correct ? 'text-[#39ff14]' : 'text-rose-400'
                    }`}>
                      [{sub.is_correct ? 'CORRECT' : 'WRONG'}]
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {sub.profiles?.username || sub.profiles?.full_name || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {sub.ctf_challenges?.title || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {sub.ctf_challenges?.ctf_competitions?.title || 'Unknown'}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-slate-800/50 px-2 py-1 font-mono text-xs text-slate-400">
                      {sub.submitted_flag.length > 40
                        ? sub.submitted_flag.substring(0, 40) + '...'
                        : sub.submitted_flag}
                    </code>
                  </td>
                  <td className="px-4 py-3 font-terminal text-xs text-slate-500">
                    {new Date(sub.submitted_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <a
              href={`/admin/ctf/submissions?filter=${filter}&page=${page - 1}`}
              className="rounded border border-purple-500/50 bg-purple-500/10 px-3 py-1.5 font-terminal text-xs text-purple-300 hover:bg-purple-500/20"
            >
              ← Prev
            </a>
          )}
          <span className="font-terminal text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/admin/ctf/submissions?filter=${filter}&page=${page + 1}`}
              className="rounded border border-purple-500/50 bg-purple-500/10 px-3 py-1.5 font-terminal text-xs text-purple-300 hover:bg-purple-500/20"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
