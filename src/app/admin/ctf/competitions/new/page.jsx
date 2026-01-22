// src/app/admin/ctf/competitions/new/page.jsx
import Link from "next/link";
import CompetitionForm from "@/components/admin/CompetitionForm";

export default function NewCompetitionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/ctf/competitions"
          className="font-terminal text-xs text-purple-400 hover:text-amber-300"
        >
          ← Back to Competitions
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-white">New Competition</h1>
        <p className="mt-1 text-sm text-slate-400">
          Create a new CTF competition.
        </p>
      </div>

      {/* Form */}
      <div className="clip-cyber border border-purple-900/50 bg-black/60 p-6">
        <CompetitionForm />
      </div>
    </div>
  );
}
