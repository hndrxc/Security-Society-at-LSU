'use client'

import { useActionState } from 'react'
import { createChallenge, updateChallenge } from '@/app/admin/actions'

const categories = [
  'web',
  'crypto',
  'forensics',
  'pwn',
  'reversing',
  'misc',
  'osint',
  'steganography'
]

const difficulties = ['easy', 'medium', 'hard', 'insane']

export default function ChallengeForm({ competitionId, challenge }) {
  const isEditing = !!challenge

  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    const action = isEditing ? updateChallenge : createChallenge
    return await action(prevState, formData)
  }, null)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="competition_id" value={competitionId} />
      {isEditing && <input type="hidden" name="id" value={challenge.id} />}

      {/* Title and Category row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-terminal text-xs uppercase text-slate-400">
            Title *
          </label>
          <input
            name="title"
            type="text"
            required
            defaultValue={challenge?.title || ''}
            placeholder="Challenge title"
            className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-terminal text-xs uppercase text-slate-400">
            Category *
          </label>
          <select
            name="category"
            required
            defaultValue={challenge?.category || 'misc'}
            className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Difficulty, Points, Sort Order row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block font-terminal text-xs uppercase text-slate-400">
            Difficulty *
          </label>
          <select
            name="difficulty"
            required
            defaultValue={challenge?.difficulty || 'medium'}
            className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:outline-none"
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-terminal text-xs uppercase text-slate-400">
            Points *
          </label>
          <input
            name="points"
            type="number"
            min="1"
            required
            defaultValue={challenge?.points || 100}
            className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-terminal text-xs uppercase text-slate-400">
            Sort Order
          </label>
          <input
            name="sort_order"
            type="number"
            min="0"
            defaultValue={challenge?.sort_order || 0}
            className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block font-terminal text-xs uppercase text-slate-400">
          Description *
        </label>
        <textarea
          name="description"
          rows={3}
          required
          defaultValue={challenge?.description || ''}
          placeholder="Challenge description with any hints or context..."
          className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
        />
      </div>

      {/* Flag and Format */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-terminal text-xs uppercase text-slate-400">
            Flag {isEditing ? '(leave blank to keep current)' : '*'}
          </label>
          <input
            name="flag"
            type="text"
            required={!isEditing}
            placeholder="SSL{th3_fl4g_h3r3}"
            className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 font-mono text-sm text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-terminal text-xs uppercase text-slate-400">
            Flag Format (hint)
          </label>
          <input
            name="flag_format"
            type="text"
            defaultValue={challenge?.flag_format || ''}
            placeholder="SSL{...}"
            className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Case sensitive and Max attempts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="case_sensitive"
            id={`case_sensitive_${challenge?.id || 'new'}`}
            value="true"
            defaultChecked={challenge?.case_sensitive ?? true}
            className="h-4 w-4 rounded border-purple-900 bg-black/60 text-amber-400"
          />
          <label htmlFor={`case_sensitive_${challenge?.id || 'new'}`} className="text-sm text-slate-300">
            Case sensitive flag
          </label>
        </div>
        <div>
          <label className="mb-1 block font-terminal text-xs uppercase text-slate-400">
            Max Attempts (blank = unlimited)
          </label>
          <input
            name="max_attempts"
            type="number"
            min="1"
            defaultValue={challenge?.max_attempts || ''}
            placeholder="Unlimited"
            className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
          />
        </div>
      </div>

      {/* URLs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-terminal text-xs uppercase text-slate-400">
            Challenge URL
          </label>
          <input
            name="challenge_url"
            type="url"
            defaultValue={challenge?.challenge_url || ''}
            placeholder="https://..."
            className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-terminal text-xs uppercase text-slate-400">
            Attachment URL
          </label>
          <input
            name="attachment_url"
            type="url"
            defaultValue={challenge?.attachment_url || ''}
            placeholder="https://..."
            className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Hints */}
      <div className="space-y-3">
        <div className="font-terminal text-xs uppercase text-slate-400">Hints (optional)</div>
        {[1, 2, 3].map((num) => (
          <div key={num} className="grid gap-2 sm:grid-cols-4">
            <div className="sm:col-span-3">
              <input
                name={`hint_${num}`}
                type="text"
                defaultValue={challenge?.[`hint_${num}`] || ''}
                placeholder={`Hint ${num} text`}
                className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
              />
            </div>
            <div>
              <input
                name={`hint_${num}_cost`}
                type="number"
                min="0"
                defaultValue={challenge?.[`hint_${num}_cost`] || 0}
                placeholder="Cost"
                className="w-full rounded border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Visible toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="is_visible"
          id={`is_visible_${challenge?.id || 'new'}`}
          value="true"
          defaultChecked={challenge?.is_visible ?? true}
          className="h-4 w-4 rounded border-purple-900 bg-black/60 text-amber-400"
        />
        <label htmlFor={`is_visible_${challenge?.id || 'new'}`} className="text-sm text-slate-300">
          Visible to users
        </label>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-amber-400 px-4 py-2 font-semibold text-black shadow shadow-amber-500/20 transition-all hover:bg-amber-300 disabled:opacity-50"
        >
          {pending ? 'Saving...' : isEditing ? 'Update Challenge' : 'Add Challenge'}
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
