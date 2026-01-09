// src/app/admin/ctf/competitions/[id]/page.jsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CompetitionForm from "@/components/admin/CompetitionForm";
import DeleteCompetitionButton from "@/components/admin/DeleteCompetitionButton";
import CollaboratorManager from "@/components/admin/CollaboratorManager";
import { createClient } from "../../../../../../utils/supabase/server";
import { getCollaborators } from "@/app/admin/actions";

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

export default async function EditCompetitionPage({ params }) {
  const { id } = await params;
  const supabase = await requireAdmin();

  const { data: competition, error } = await supabase
    .from("ctf_competitions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !competition) {
    notFound();
  }

  // Fetch collaborators
  const { collaborators, isOwner } = await getCollaborators(id);

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
          <h1 className="mt-2 text-2xl font-semibold text-white">Edit Competition</h1>
          <p className="mt-1 text-sm text-slate-400">
            Update competition details.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/ctf/competitions/${id}/challenges`}
            className="rounded border border-purple-500/50 bg-purple-500/10 px-4 py-2 font-terminal text-xs text-purple-300 hover:bg-purple-500/20"
          >
            Manage Challenges
          </Link>
          <Link
            href={`/ctf/${id}`}
            target="_blank"
            className="rounded border border-slate-500/50 bg-slate-500/10 px-4 py-2 font-terminal text-xs text-slate-300 hover:bg-slate-500/20"
          >
            View Live →
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="clip-cyber border border-purple-900/50 bg-black/60 p-6">
        <CompetitionForm competition={competition} />

        {/* Collaborators */}
        <CollaboratorManager
          competitionId={id}
          collaborators={collaborators}
          isOwner={isOwner}
        />
      </div>

      {/* Danger zone - only show for owner */}
      {isOwner && (
      <div className="clip-cyber border border-rose-900/50 bg-rose-500/5 p-6">
        <h2 className="font-terminal text-sm uppercase text-rose-400">[DANGER ZONE]</h2>
        <p className="mt-2 text-sm text-slate-400">
          Deleting a competition will also delete all its challenges, submissions, and solves.
          This action cannot be undone.
        </p>
        <div className="mt-4">
          <DeleteCompetitionButton id={id} title={competition.title} />
        </div>
      </div>
      )}
    </div>
  );
}
