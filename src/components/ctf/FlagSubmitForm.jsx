"use client";

import { useActionState, useId } from "react";
import { Button, Feedback } from "@/components/ui/primitives";
import { submitFlag } from "@/app/ctf/actions";

export default function FlagSubmitForm({ challengeId, disabled, onSuccess }) {
  const fieldId = useId();
  const [state, formAction, pending] = useActionState(
    async (prevState, formData) => {
      const result = await submitFlag(prevState, formData);
      if (result.success && onSuccess) {
        onSuccess(result);
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-3" aria-busy={pending}>
      <label htmlFor={fieldId} className="block text-sm">
        Flag
      </label>
      <input type="hidden" name="challengeId" value={challengeId} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={fieldId}
          name="flag"
          type="text"
          placeholder="SSL{...}"
          disabled={disabled || pending}
          autoComplete="off"
          className="lab-input flex-1"
        />
        <Button type="submit" disabled={disabled || pending}>
          {pending ? "Checking..." : "Submit Flag"}
        </Button>
      </div>
      {state?.message && (
        <Feedback tone={state.success ? "success" : "error"}>
          <span>{state.success ? "[SUCCESS]" : "[ERROR]"}</span>
          <span className="ml-2">{state.message}</span>
          {state.success && state.pointsAwarded > 0 && (
            <span className="ml-2 text-amber-300">
              +{state.pointsAwarded} pts
            </span>
          )}
          {state.firstBlood && (
            <span className="ml-2 text-rose-400">FIRST BLOOD!</span>
          )}
        </Feedback>
      )}
    </form>
  );
}
