"use client";

import { deleteChallenge } from "@/app/admin/actions";
import DeleteButton from "./DeleteButton";

export default function DeleteChallengeButton({ id, competitionId, title }) {
  return (
    <DeleteButton
      title={title}
      label="Delete Challenge"
      onDelete={() => deleteChallenge(id, competitionId)}
      compact
    />
  );
}
