'use client'

import { useState } from 'react'
import { unlockHint } from '@/app/ctf/actions'

export default function HintButton({
  challengeId,
  hintNumber,
  cost,
  isUnlocked,
  isLoggedIn,
  onUnlock
}) {
  const [loading, setLoading] = useState(false)
  const [hintText, setHintText] = useState(null)
  const [error, setError] = useState(null)
  const [showHint, setShowHint] = useState(isUnlocked)

  const handleUnlock = async () => {
    if (!isLoggedIn) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('challengeId', challengeId)
    formData.set('hintNumber', hintNumber.toString())

    const result = await unlockHint(null, formData)

    setLoading(false)

    if (result.success) {
      setHintText(result.hintText)
      setShowHint(true)
      if (onUnlock) {
        onUnlock(hintNumber, result.hintText)
      }
    } else {
      setError(result.message)
    }
  }

  if (showHint && hintText) {
    return (
      <div className="w-full rounded border border-purple-500/30 bg-purple-500/10 p-3">
        <div className="font-terminal mb-1 text-xs text-purple-400">
          HINT {hintNumber}:
        </div>
        <p className="text-sm text-slate-300">{hintText}</p>
      </div>
    )
  }

  if (showHint && !hintText) {
    // Already unlocked but we don't have the text (page refresh)
    return (
      <button
        onClick={handleUnlock}
        disabled={loading}
        className="rounded border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 font-terminal text-xs text-purple-300 transition-colors hover:bg-purple-500/20 disabled:opacity-50"
      >
        {loading ? 'Loading...' : `View Hint ${hintNumber}`}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleUnlock}
        disabled={loading || !isLoggedIn}
        className="rounded border border-slate-600/50 bg-slate-700/30 px-3 py-1.5 font-terminal text-xs text-slate-400 transition-colors hover:bg-slate-600/30 hover:text-slate-300 disabled:opacity-50"
      >
        {loading ? 'Unlocking...' : (
          <>
            Hint {hintNumber}
            {cost > 0 && <span className="ml-1 text-rose-400">(-{cost} pts)</span>}
            {cost === 0 && <span className="ml-1 text-[#39ff14]">(free)</span>}
          </>
        )}
      </button>
      {error && (
        <span className="text-xs text-rose-400">{error}</span>
      )}
    </div>
  )
}
