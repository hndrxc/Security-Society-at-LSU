import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../../utils/supabase/server";
import EventForm from "@/components/admin/EventForm";
import DeleteEventButton from "@/components/admin/DeleteEventButton";

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

export default async function EditEventPage({ params }) {
  const { id } = await params;
  const supabase = await requireAdmin();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

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
        <EventForm event={event} />
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
