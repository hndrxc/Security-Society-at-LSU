export default function LeaderboardTable({
  entries,
  currentUserId,
  limit = 10,
  detailed = false,
  challengeCount,
}) {
  const displayEntries = entries?.slice(0, limit) || [];
  if (!displayEntries.length)
    return (
      <p className="lab-feedback lab-muted">
        No solves yet. The leaderboard is waiting for its first flag.
      </p>
    );
  return (
    <div className="lab-table-wrap">
      <table className="lab-table">
        <caption className="sr-only">Competition leaderboard</caption>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Player</th>
            <th scope="col">Points</th>
            <th scope="col" className={detailed ? "" : "hidden sm:table-cell"}>
              Solved
            </th>
            {detailed && (
              <>
                <th scope="col" className="hidden sm:table-cell">
                  Last solve
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {displayEntries.map((entry) => (
            <tr
              key={entry.user_id}
              data-current={entry.user_id === currentUserId}
            >
              <td className="font-terminal text-amber-300">
                {String(entry.rank).padStart(2, "0")}
              </td>
              <td>
                {entry.username || entry.full_name || "Anonymous"}
                {entry.user_id === currentUserId && (
                  <span className="block text-xs text-purple-300 mt-1">
                    You
                  </span>
                )}
              </td>
              <td className="font-terminal">{entry.total_points}</td>
              <td className={detailed ? "" : "hidden sm:table-cell"}>
                {entry.challenges_solved}
                {challengeCount != null && `/${challengeCount}`}
              </td>
              {detailed && (
                <>
                  <td className="hidden sm:table-cell lab-muted">
                    {entry.last_solve_at
                      ? new Date(entry.last_solve_at).toLocaleString()
                      : "—"}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
