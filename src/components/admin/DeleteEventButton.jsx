"use client";

import { deleteEvent } from "@/app/admin/events/actions";
import DeleteButton from "./DeleteButton";

export default function DeleteEventButton({ id, title }) {
  return (
    <DeleteButton
      title={title}
      label="Delete Event"
      onDelete={() => deleteEvent(id)}
      redirectTo="/admin/events"
    />
  );
}
