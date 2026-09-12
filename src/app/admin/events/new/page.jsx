import Link from "next/link";
import EventForm from "@/components/admin/EventForm";
import { requireAdminPage } from "../../../../../utils/auth/requireAdmin";

export default async function NewEventPage() {
  const { supabase } = await requireAdminPage();
  const { data: competitions, error } = await supabase
    .from("ctf_competitions")
    .select("id,title,is_active")
    .order("starts_at", { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/events"
          className="font-terminal text-xs text-purple-400 hover:text-amber-300"
        >
          ← Back to Events
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-white">New Event</h1>
        <p className="mt-1 text-sm text-slate-400">
          Create a new event or operation.
        </p>
      </div>

      {/* Form */}
      <div className="clip-cyber border border-purple-900/50 bg-black/60 p-6">
        <EventForm competitions={competitions || []} competitionsError={Boolean(error)} />
      </div>
    </div>
  );
}
