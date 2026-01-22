'use client'

import { useState, useEffect } from 'react'
import FlagSubmitForm from './FlagSubmitForm'
import HintButton from './HintButton'

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hard: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  insane: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
}

const categoryIcons = {
  web: '[WEB]',
  crypto: '[CRYPTO]',
  forensics: '[FORENSICS]',
  pwn: '[PWN]',
  reversing: '[REV]',
  misc: '[MISC]',
  osint: '[OSINT]',
  steganography: '[STEGO]'
}

export default function ChallengeCard({
  challenge,
  isSolved,
  solveInfo,
  unlockedHints,
  isLoggedIn,
  competitionActive
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localSolved, setLocalSolved] = useState(isSolved)
  const [localHints, setLocalHints] = useState(unlockedHints || [])

  // Sync local state when props change (e.g., after page revalidation)
  useEffect(() => {
    setLocalSolved(isSolved)
  }, [isSolved])

  useEffect(() => {
    setLocalHints(unlockedHints || [])
  }, [unlockedHints])

  const handleSolveSuccess = (result) => {
    setLocalSolved(true)
  }

  const handleHintUnlock = (hintNumber, hintText) => {
    setLocalHints([...localHints, { hint_number: hintNumber }])
  }

  const difficultyClass = difficultyColors[challenge.difficulty] || difficultyColors.medium
  const categoryIcon = categoryIcons[challenge.category?.toLowerCase()] || `[${challenge.category?.toUpperCase()}]`

  const hints = [
    { number: 1, text: challenge.hint_1, cost: challenge.hint_1_cost },
    { number: 2, text: challenge.hint_2, cost: challenge.hint_2_cost },
    { number: 3, text: challenge.hint_3, cost: challenge.hint_3_cost }
  ].filter(h => h.text)

  const isHintUnlocked = (hintNumber) =>
    localHints.some(h => h.hint_number === hintNumber)

  return (
    <div
      className={`clip-cyber border transition-all ${
        localSolved
          ? 'border-[#39ff14]/50 bg-[#39ff14]/5'
          : 'border-purple-900/60 bg-black/60 hover:border-purple-500/60'
      }`}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-start justify-between p-4 text-left"
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-terminal text-xs text-purple-400">{categoryIcon}</span>
            <h3 className={`font-semibold ${localSolved ? 'text-[#39ff14]' : 'text-white'}`}>
              {challenge.title}
            </h3>
            {localSolved && (
              <span className="font-terminal text-xs text-[#39ff14]">[SOLVED]</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded border px-2 py-0.5 font-terminal text-xs ${difficultyClass}`}>
              {challenge.difficulty?.toUpperCase()}
            </span>
            <span className="font-terminal text-xs text-amber-300">
              {challenge.points} pts
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-terminal text-xs text-slate-500">
            {isExpanded ? '[-]' : '[+]'}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-purple-900/40 p-4 pt-0">
          <div className="mt-4 space-y-4">
            {/* Description */}
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-sm text-slate-300">
                {challenge.description}
              </p>
            </div>

            {/* Flag format hint */}
            {challenge.flag_format && (
              <div className="font-terminal text-xs text-slate-500">
                FLAG FORMAT: <span className="text-purple-400">{challenge.flag_format}</span>
              </div>
            )}

            {/* Challenge URL */}
            {challenge.challenge_url && (
              <div>
                <a
                  href={challenge.challenge_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded border border-purple-500/50 bg-purple-500/10 px-3 py-2 font-terminal text-xs text-purple-300 transition-colors hover:bg-purple-500/20"
                >
                  [LAUNCH CHALLENGE] →
                </a>
              </div>
            )}

            {/* Attachment */}
            {challenge.attachment_url && (
              <div>
                <a
                  href={challenge.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded border border-amber-500/50 bg-amber-500/10 px-3 py-2 font-terminal text-xs text-amber-300 transition-colors hover:bg-amber-500/20"
                >
                  [DOWNLOAD FILES] ↓
                </a>
              </div>
            )}

            {/* Hints section */}
            {hints.length > 0 && !localSolved && (
              <div className="space-y-2">
                <div className="font-terminal text-xs text-slate-500">HINTS:</div>
                <div className="flex flex-wrap gap-2">
                  {hints.map((hint) => (
                    <HintButton
                      key={hint.number}
                      challengeId={challenge.id}
                      hintNumber={hint.number}
                      cost={hint.cost}
                      isUnlocked={isHintUnlocked(hint.number)}
                      isLoggedIn={isLoggedIn}
                      onUnlock={handleHintUnlock}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Solve info */}
            {localSolved && solveInfo && (
              <div className="font-terminal rounded border border-[#39ff14]/30 bg-[#39ff14]/5 p-3 text-xs">
                <div className="text-[#39ff14]">
                  SOLVED: {new Date(solveInfo.solved_at).toLocaleString()}
                </div>
                <div className="text-amber-300">
                  POINTS AWARDED: +{solveInfo.points_awarded}
                </div>
              </div>
            )}

            {/* Flag submission */}
            {!localSolved && (
              <div className="pt-2">
                {isLoggedIn ? (
                  competitionActive ? (
                    <FlagSubmitForm
                      challengeId={challenge.id}
                      onSuccess={handleSolveSuccess}
                    />
                  ) : (
                    <div className="font-terminal rounded border border-slate-500/30 bg-slate-500/10 p-3 text-xs text-slate-400">
                      [COMPETITION NOT ACTIVE]
                    </div>
                  )
                ) : (
                  <div className="font-terminal rounded border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                    [LOGIN REQUIRED TO SUBMIT FLAGS]
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
