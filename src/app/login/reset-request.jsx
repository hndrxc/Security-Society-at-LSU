"use client";

import { useActionState } from "react";
import { sendReset } from "./actions";

const initialState = { type: null, message: null };

export default function ResetRequest() {
  const [state, formAction, pending] = useActionState(sendReset, initialState);

  const inputClasses =
    "w-full rounded-xl border border-purple-900/60 bg-black/40 px-4 py-3 text-slate-100 placeholder-slate-500 shadow-inner shadow-purple-900/20 focus:border-amber-400 focus:outline-none focus:ring focus:ring-amber-300/30";
  const labelClasses = "text-sm font-semibold text-amber-200";

  return (
    <form className="mt-6 space-y-3 rounded-2xl border border-purple-900/40 bg-black/30 p-4" action={formAction}>
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
        <p className={`text-sm ${state.type === "error" ? "text-rose-300" : "text-amber-200"}`}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-xl border border-purple-500/60 px-4 py-3 text-sm font-semibold text-purple-100 transition-colors hover:border-purple-400 hover:bg-purple-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
        disabled={pending}
      >
        {pending ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
