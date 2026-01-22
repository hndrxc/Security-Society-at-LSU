'use client'

import { useActionState } from 'react'
import { submitFlag } from '@/app/ctf/actions'

export default function FlagSubmitForm({ challengeId, disabled, onSuccess }) {
  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    const result = await submitFlag(prevState, formData)
    if (result.success && onSuccess) {
      onSuccess(result)
    }
    return result
  }, null)

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="challengeId" value={challengeId} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="flag"
          type="text"
          placeholder="SSL{...}"
          disabled={disabled || pending}
          autoComplete="off"
          className="flex-1 rounded-lg border border-purple-900/60 bg-black/60 px-4 py-3 font-mono text-sm text-slate-100 placeholder-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || pending}
          className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-amber-500/40 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? 'Checking...' : 'Submit Flag'}
        </button>
      </div>
      {state?.message && (
        <div className={`font-terminal rounded border px-3 py-2 text-sm ${
          state.success
            ? 'border-[#39ff14]/50 bg-[#39ff14]/10 text-[#39ff14]'
            : 'border-rose-500/50 bg-rose-500/10 text-rose-300'
        }`}>
          <span>{state.success ? '[SUCCESS]' : '[ERROR]'}</span>
          <span className="ml-2">{state.message}</span>
          {state.success && state.pointsAwarded > 0 && (
            <span className="ml-2 text-amber-300">+{state.pointsAwarded} pts</span>
          )}
          {state.firstBlood && (
            <span className="ml-2 text-rose-400">FIRST BLOOD!</span>
          )}
        </div>
      )}
    </form>
  )
}
