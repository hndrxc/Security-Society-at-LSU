"use client";

import { deleteCompetition } from "@/app/admin/actions";
import DeleteButton from "./DeleteButton";

export default function DeleteCompetitionButton({ id, title }) {
  return (
    <DeleteButton
      title={title}
      label="Delete Competition"
      onDelete={() => deleteCompetition(id)}
      redirectTo="/admin/ctf/competitions"
    />
  );
}
