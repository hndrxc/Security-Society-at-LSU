'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({
  title,
  label,
  onDelete,
  redirectTo,
  compact = false,
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const result = await onDelete()
      if (result.success) {
        if (redirectTo) router.push(redirectTo)
        else router.refresh()
      } else {
        alert(result.message)
        setConfirming(false)
      }
    } catch {
      alert('Unable to delete. Please try again.')
      setConfirming(false)
    } finally {
      setDeleting(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-rose-300">
          Delete &quot;{title}&quot;?{!compact && " This cannot be undone."}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-rose-400 disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : compact ? 'Yes' : 'Yes, Delete'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="rounded border border-slate-600 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-700/50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={`rounded border border-rose-500/50 bg-rose-500/10 ${compact ? "px-3 py-1.5" : "px-4 py-2"} font-terminal text-xs text-rose-300 transition-colors hover:bg-rose-500/20`}
    >
      {label}
    </button>
  )
}
