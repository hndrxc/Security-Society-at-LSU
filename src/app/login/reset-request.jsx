"use client";
import { Feedback } from "@/components/ui/primitives";

import { useActionState } from "react";
import { sendReset } from "./actions";

const initialState = { type: null, message: null };

export default function ResetRequest() {
  const [state, formAction, pending] = useActionState(sendReset, initialState);

  const inputClasses = "lab-input";
  const labelClasses = "text-sm font-medium";

  return (
    <form className="mt-8 space-y-4 border-t border-[var(--line)] pt-6" action={formAction}>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Forgot password?</p>
        <p className="text-sm text-slate-300">Enter your email and we&apos;ll send a reset link.</p>
      </div>

      <div className="space-y-2">
        <label className={labelClasses} htmlFor="resetEmail">
          Email for reset
        </label>
        <input
          id="resetEmail"
          name="resetEmail"
          type="email"
          required
          className={inputClasses}
          placeholder="you@example.com"
          disabled={pending}
        />
      </div>

      {state?.message && (
        <Feedback tone={state.type}>{state.message}</Feedback>
      )}

      <button
        type="submit"
        className="lab-button lab-button--secondary w-full"
        disabled={pending}
      >
        {pending ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
