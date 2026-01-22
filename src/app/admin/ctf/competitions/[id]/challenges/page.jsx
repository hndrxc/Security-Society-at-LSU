// src/app/admin/ctf/competitions/[id]/challenges/page.jsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ChallengeForm from "@/components/admin/ChallengeForm";
import DeleteChallengeButton from "@/components/admin/DeleteChallengeButton";
import { createClient } from "../../../../../../../utils/supabase/server";

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

export default async function ChallengesPage({ params }) {
  const { id } = await params;
  const supabase = await requireAdmin();

  // Get competition
  const { data: competition, error: compError } = await supabase
    .from("ctf_competitions")
    .select("id, title")
    .eq("id", id)
    .single();

  if (compError || !competition) {
    notFound();
  }

  // Get challenges
  const { data: challenges } = await supabase
    .from("ctf_challenges")
    .select("*")
    .eq("competition_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  // Get solve counts per challenge
  const { data: solveCounts } = await supabase
    .from("ctf_solves")
    .select("challenge_id")
    .eq("competition_id", id);

  const solveMap = (solveCounts || []).reduce((acc, s) => {
    acc[s.challenge_id] = (acc[s.challenge_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/ctf/competitions"
            className="font-terminal text-xs text-purple-400 hover:text-amber-300"
          >
            ← Back to Competitions
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Challenges: {competition.title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage challenges for this competition.
          </p>
        </div>
        <Link
          href={`/admin/ctf/competitions/${id}`}
          className="rounded border border-amber-500/50 bg-amber-500/10 px-4 py-2 font-terminal text-xs text-amber-300 hover:bg-amber-500/20"
        >
          Edit Competition
        </Link>
      </div>

      {/* Add challenge form */}
      <div className="clip-cyber border border-purple-900/50 bg-black/60 p-6">
        <h2 className="mb-4 font-terminal text-sm uppercase text-amber-300">
          [ADD NEW CHALLENGE]
        </h2>
        <ChallengeForm competitionId={id} />
      </div>

      {/* Existing challenges */}
      <div className="space-y-4">
        <h2 className="font-terminal text-sm uppercase text-slate-400">
          [EXISTING CHALLENGES: {challenges?.length || 0}]
        </h2>

        {!challenges?.length ? (
          <div className="clip-cyber border border-purple-900/50 bg-black/40 p-6 text-center">
            <p className="text-slate-500">No challenges yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <details
                key={challenge.id}
                className="group clip-cyber border border-purple-900/50 bg-black/60"
              >
                <summary className="flex cursor-pointer items-center justify-between p-4 hover:bg-purple-500/10">
                  <div className="flex items-center gap-4">
                    <span className="font-terminal text-xs text-slate-500">
                      #{challenge.sort_order}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{challenge.title}</span>
                        <span className={`rounded px-2 py-0.5 font-terminal text-xs ${
                          challenge.is_visible
                            ? 'bg-[#39ff14]/20 text-[#39ff14]'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {challenge.is_visible ? 'VISIBLE' : 'HIDDEN'}
                        </span>
                      </div>
                      <div className="flex gap-3 font-terminal text-xs text-slate-500">
                        <span className="text-purple-300">{challenge.category}</span>
                        <span>{challenge.difficulty}</span>
                        <span className="text-amber-300">{challenge.points} pts</span>
                        <span className="text-[#39ff14]">{solveMap[challenge.id] || 0} solves</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-terminal text-xs text-slate-500 group-open:hidden">
                    [+]
                  </span>
                  <span className="hidden font-terminal text-xs text-slate-500 group-open:inline">
                    [-]
                  </span>
                </summary>
                <div className="border-t border-purple-900/30 p-4">
                  <ChallengeForm
                    competitionId={id}
                    challenge={challenge}
                  />
                  <div className="mt-4 border-t border-purple-900/30 pt-4">
                    <DeleteChallengeButton
                      id={challenge.id}
                      competitionId={id}
                      title={challenge.title}
                    />
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
