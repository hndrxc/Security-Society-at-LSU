// src/app/admin/ctf/competitions/page.jsx
import Link from "next/link";
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

export default async function CompetitionsPage() {
  const supabase = await requireAdmin();

  const { data: competitions } = await supabase
    .from("ctf_competitions")
    .select("*")
    .order("created_at", { ascending: false });

  // Get challenge counts
  const { data: challengeCounts } = await supabase
    .from("ctf_challenges")
    .select("competition_id");

  const countMap = (challengeCounts || []).reduce((acc, ch) => {
    acc[ch.competition_id] = (acc[ch.competition_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Competitions</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage CTF competitions and their challenges.
          </p>
        </div>
        <Link
          href="/admin/ctf/competitions/new"
          className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:bg-amber-300"
        >
          + New Competition
        </Link>
      </div>

      {/* Competition list */}
      {!competitions?.length ? (
        <div className="clip-cyber border border-purple-900/50 bg-black/60 p-8 text-center">
          <div className="font-terminal mb-4 text-4xl text-purple-500/40">[NO DATA]</div>
          <p className="text-slate-400">No competitions yet.</p>
          <Link
            href="/admin/ctf/competitions/new"
            className="mt-4 inline-block rounded border border-amber-500/50 bg-amber-500/10 px-4 py-2 font-terminal text-sm text-amber-300 hover:bg-amber-500/20"
          >
            Create your first competition
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {competitions.map((comp) => {
            const now = new Date();
            const start = new Date(comp.starts_at);
            const end = new Date(comp.ends_at);
            const isUpcoming = now < start;
            const isActive = now >= start && now <= end;
            const isEnded = now > end;

            return (
              <div
                key={comp.id}
                className="clip-cyber border border-purple-900/50 bg-black/60 p-4 transition-colors hover:border-purple-500/50"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-white">{comp.title}</h2>
                      <span className={`rounded px-2 py-0.5 font-terminal text-xs ${
                        comp.is_active
                          ? 'bg-[#39ff14]/20 text-[#39ff14]'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {comp.is_active ? 'VISIBLE' : 'HIDDEN'}
                      </span>
                      <span className={`rounded px-2 py-0.5 font-terminal text-xs ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300'
                          : isUpcoming
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {isActive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'ENDED'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 font-terminal text-xs text-slate-500">
                      <span>
                        CHALLENGES: <span className="text-purple-300">{countMap[comp.id] || 0}</span>
                      </span>
                      <span>
                        START: <span className="text-slate-400">{start.toLocaleDateString()}</span>
                      </span>
                      <span>
                        END: <span className="text-slate-400">{end.toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/ctf/competitions/${comp.id}/challenges`}
                      className="rounded border border-purple-500/50 bg-purple-500/10 px-3 py-1.5 font-terminal text-xs text-purple-300 hover:bg-purple-500/20"
                    >
                      Challenges
                    </Link>
                    <Link
                      href={`/admin/ctf/competitions/${comp.id}`}
                      className="rounded border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 font-terminal text-xs text-amber-300 hover:bg-amber-500/20"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
