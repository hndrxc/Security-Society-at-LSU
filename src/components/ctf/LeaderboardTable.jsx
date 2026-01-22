export default function LeaderboardTable({ entries, currentUserId, limit = 10 }) {
  const displayEntries = entries?.slice(0, limit) || []

  if (!displayEntries.length) {
    return (
      <div className="font-terminal rounded border border-purple-900/50 bg-black/40 p-4 text-center text-sm text-slate-500">
        [NO SOLVES YET]
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded border border-purple-900/50 bg-black/40">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-purple-900/50 font-terminal text-xs uppercase text-slate-500">
            <th className="px-3 py-2">Rank</th>
            <th className="px-3 py-2">Player</th>
            <th className="px-3 py-2 text-right">Points</th>
            <th className="hidden px-3 py-2 text-right sm:table-cell">Solved</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-purple-900/30">
          {displayEntries.map((entry) => {
            const isCurrentUser = entry.user_id === currentUserId
            const rankDisplay = entry.rank <= 3 ? (
              <span className={`font-bold ${
                entry.rank === 1 ? 'text-amber-400' :
                entry.rank === 2 ? 'text-slate-300' :
                'text-amber-600'
              }`}>
                {entry.rank === 1 ? '1st' : entry.rank === 2 ? '2nd' : '3rd'}
              </span>
            ) : (
              <span className="text-slate-400">{entry.rank}</span>
            )

            return (
              <tr
                key={entry.user_id}
                className={`${isCurrentUser ? 'bg-purple-500/10' : ''}`}
              >
                <td className="px-3 py-2 font-terminal">
                  {rankDisplay}
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className={isCurrentUser ? 'font-semibold text-amber-200' : 'text-slate-200'}>
                      {entry.username || entry.full_name || 'Anonymous'}
                    </span>
                    {isCurrentUser && (
                      <span className="font-terminal text-xs text-purple-400">[YOU]</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-terminal text-amber-300">
                  {entry.total_points}
                </td>
                <td className="hidden px-3 py-2 text-right text-slate-400 sm:table-cell">
                  {entry.challenges_solved}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
