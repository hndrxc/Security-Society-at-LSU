'use client'

import { useActionState } from 'react'
import { addCollaborator, removeCollaborator } from '@/app/admin/actions'

export default function CollaboratorManager({ competitionId, collaborators, isOwner }) {
  const [state, formAction, pending] = useActionState(addCollaborator, null)

  async function handleRemove(collaboratorUserId) {
    if (!confirm('Remove this collaborator?')) return
    await removeCollaborator(competitionId, collaboratorUserId)
  }

  if (!isOwner) {
    // Read-only view for non-owners
    if (!collaborators || collaborators.length === 0) {
      return null
    }

    return (
      <div className="mt-6 rounded-lg border border-purple-900/40 bg-black/30 p-4">
        <h3 className="mb-3 font-terminal text-xs uppercase text-slate-400">
          Collaborators
        </h3>
        <ul className="space-y-2">
          {collaborators.map((c) => (
            <li key={c.id} className="flex items-center gap-2 text-sm text-slate-300">
              <span className="font-medium">
                {c.profiles?.email || 'Unknown'}
              </span>
              <span className="rounded bg-purple-900/40 px-2 py-0.5 text-xs text-purple-300">
                {c.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-lg border border-purple-900/40 bg-black/30 p-4">
      <h3 className="mb-3 font-terminal text-xs uppercase text-slate-400">
        Manage Collaborators
      </h3>

      {/* Add collaborator form */}
      <form action={formAction} className="mb-4 flex flex-wrap gap-2">
        <input type="hidden" name="competition_id" value={competitionId} />
        <input
          type="email"
          name="email"
          placeholder="Admin email address"
          required
          className="flex-1 min-w-[200px] rounded-lg border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
        />
        <select
          name="role"
          className="rounded-lg border border-purple-900/60 bg-black/60 px-3 py-2 text-sm text-white focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
        >
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
        >
          {pending ? 'Adding...' : 'Add'}
        </button>
      </form>

      {state?.message && (
        <p className={`mb-3 font-terminal text-xs ${
          state.success ? 'text-[#39ff14]' : 'text-rose-400'
        }`}>
          {state.message}
        </p>
      )}

      {/* Collaborators list */}
      {collaborators && collaborators.length > 0 ? (
        <ul className="space-y-2">
          {collaborators.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-purple-900/30 bg-black/40 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">
                  {c.profiles?.email || 'Unknown'}
                </span>
                <span className="rounded bg-purple-900/40 px-2 py-0.5 text-xs text-purple-300">
                  {c.role}
                </span>
              </div>
              <button
                onClick={() => handleRemove(c.user_id)}
                className="text-xs text-rose-400 transition-colors hover:text-rose-300"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No collaborators yet.</p>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Editors can create, edit, and delete challenges. Viewers have read-only access.
      </p>
    </div>
  )
}
