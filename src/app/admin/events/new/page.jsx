import Link from "next/link";
import EventForm from "@/components/admin/EventForm";

export default function NewEventPage() {
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
        <EventForm />
      </div>
    </div>
  );
}
