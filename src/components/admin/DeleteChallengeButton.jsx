'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteChallenge } from '@/app/admin/actions'

export default function DeleteChallengeButton({ id, competitionId, title }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteChallenge(id, competitionId)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.message)
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-rose-300">
          Delete &quot;{title}&quot;?
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="rounded border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700/50"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 font-terminal text-xs text-rose-300 hover:bg-rose-500/20"
    >
      Delete Challenge
    </button>
  )
}
