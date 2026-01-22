'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createCompetition, updateCompetition } from '@/app/admin/actions'

function formatDateForInput(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

export default function CompetitionForm({ competition }) {
  const router = useRouter()
  const isEditing = !!competition

  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    const action = isEditing ? updateCompetition : createCompetition
    const result = await action(prevState, formData)

    if (result.success && !isEditing && result.id) {
      router.push(`/admin/ctf/competitions/${result.id}/challenges`)
    }

    return result
  }, null)

  return (
    <form action={formAction} className="space-y-6">
      {isEditing && <input type="hidden" name="id" value={competition.id} />}

      {/* Title */}
      <div>
        <label className="mb-2 block font-terminal text-xs uppercase text-slate-400">
          Title *
        </label>
        <input
          name="title"
          type="text"
          required
          defaultValue={competition?.title || ''}
          placeholder="Fall 2024 CTF"
          className="w-full rounded-lg border border-purple-900/60 bg-black/60 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block font-terminal text-xs uppercase text-slate-400">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={competition?.description || ''}
          placeholder="A brief description of the competition..."
          className="w-full rounded-lg border border-purple-900/60 bg-black/60 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
        />
      </div>

      {/* Rules */}
      <div>
        <label className="mb-2 block font-terminal text-xs uppercase text-slate-400">
          Rules
        </label>
        <textarea
          name="rules"
          rows={4}
          defaultValue={competition?.rules || ''}
          placeholder="Competition rules and guidelines..."
          className="w-full rounded-lg border border-purple-900/60 bg-black/60 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
        />
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block font-terminal text-xs uppercase text-slate-400">
            Start Date/Time *
          </label>
          <input
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={formatDateForInput(competition?.starts_at)}
            className="w-full rounded-lg border border-purple-900/60 bg-black/60 px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
          />
        </div>
        <div>
          <label className="mb-2 block font-terminal text-xs uppercase text-slate-400">
            End Date/Time *
          </label>
          <input
            name="ends_at"
            type="datetime-local"
            required
            defaultValue={formatDateForInput(competition?.ends_at)}
            className="w-full rounded-lg border border-purple-900/60 bg-black/60 px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
          />
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          value="true"
          defaultChecked={competition?.is_active ?? false}
          className="h-4 w-4 rounded border-purple-900 bg-black/60 text-amber-400 focus:ring-amber-400/30"
        />
        <label htmlFor="is_active" className="text-sm text-slate-300">
          Make competition visible to users
        </label>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-50"
        >
          {pending ? 'Saving...' : isEditing ? 'Update Competition' : 'Create Competition'}
        </button>

        {state?.message && (
          <span className={`font-terminal text-sm ${
            state.success ? 'text-[#39ff14]' : 'text-rose-400'
          }`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  )
}
