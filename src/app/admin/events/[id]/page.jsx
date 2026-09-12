import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "../../../../../utils/auth/requireAdmin";
import EventForm from "@/components/admin/EventForm";
import DeleteEventButton from "@/components/admin/DeleteEventButton";

export default async function EditEventPage({ params }) {
  const { id } = await params;
  const { supabase } = await requireAdminPage();

  const [{ data: event, error }, { data: competitions, error: competitionsError }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).single(),
    supabase.from("ctf_competitions").select("id,title,is_active").order("starts_at", { ascending: false }),
  ]);

  if (error || !event) {
    notFound();
  }

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
        <h1 className="mt-2 text-2xl font-semibold text-white">Edit Event</h1>
        <p className="mt-1 text-sm text-slate-400">
          Update event details and visibility.
        </p>
      </div>

      {/* Form */}
      <div className="clip-cyber border border-purple-900/50 bg-black/60 p-6">
        <EventForm event={event} competitions={competitions || []} competitionsError={Boolean(competitionsError)} />
      </div>

      {/* Danger Zone */}
      <div className="clip-cyber border border-rose-900/50 bg-rose-500/5 p-6">
        <h2 className="font-terminal text-sm uppercase text-rose-400">[DANGER ZONE]</h2>
        <p className="mt-2 text-sm text-slate-400">
          Deleting an event cannot be undone.
        </p>
        <div className="mt-4">
          <DeleteEventButton id={id} title={event.title} />
        </div>
      </div>
    </div>
  );
}
