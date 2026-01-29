import React from 'react';
import { useLeagueStore } from '../store/leagueStore';
import '../styles/LeaderBoard.css';

interface LeaderboardProps {
  weekNumber?: number;
}

export const LeaderBoard: React.FC<LeaderboardProps> = ({ weekNumber }) => {
  const { players, rounds, activeWeeks } = useLeagueStore();
  const TOTAL_WEEKS = 6;
  const MISSED_PENALTY = 63;

  const generateLeaderboard = () => {
    return players
      .map((player) => {
        const playerRounds = rounds.filter((r) => r.playerId === player.id);

        if (weekNumber) {
          // Weekly leaderboard
          const weekRound = playerRounds.find((r) => r.week === weekNumber);
          return {
            playerId: player.id,
            username: player.username,
            score: weekRound?.submitted ? weekRound.totalScore : MISSED_PENALTY,
            submitted: weekRound?.submitted || false,
          };
        } else {
          // Season leaderboard
          let totalScore = 0;
          const weeklyScores: (number | null)[] = [];
          let missedWeeks = 0;

          for (let week = 1; week <= TOTAL_WEEKS; week++) {
            const round = playerRounds.find((r) => r.week === week);
            if (!round || !round.submitted) {
              totalScore += MISSED_PENALTY;
              weeklyScores.push(null);
              missedWeeks++;
            } else {
              totalScore += round.totalScore;
              weeklyScores.push(round.totalScore);
            }
          }

          return {
            playerId: player.id,
            username: player.username,
            totalScore,
            weeklyScores,
            missedWeeks,
            disqualified: missedWeeks > 2,
          };
        }
      })
      .sort((a, b) => (a.score ?? 999) - (b.score ?? 999));
  };

  const leaderboard = generateLeaderboard();

  return (
    <div className="leaderboard">
      <h2>{weekNumber ? `Week ${weekNumber} Leaderboard` : 'Season Leaderboard'}</h2>

      {weekNumber && !activeWeeks.includes(weekNumber) ? (
        <div className="warning-message">
          Standings will be available once the commissioner opens Week {weekNumber}.
        </div>
      ) : !weekNumber && activeWeeks.length === 0 ? (
        <div className="warning-message">
          Season standings will be available once the commissioner opens the first week.
        </div>
      ) : weekNumber ? (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry: any, index) => (
              <tr key={entry.playerId}>
                <td className="rank">{index + 1}</td>
                <td className="name">{entry.username}</td>
                <td className="score">
                  {entry.submitted ? entry.score : (
                    <span className="not-submitted">Not Submitted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="leaderboard-table season">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                <th key={`week-${i + 1}`} className="week-header">W{i + 1}</th>
              ))}
              <th className="total-header">Total</th>
              <th>Weeks Completed</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry: any, index) => (
              <tr key={entry.playerId} className={entry.disqualified ? 'disqualified' : ''}>
                <td className="rank">{index + 1}</td>
                <td className="name">{entry.username}</td>
                {entry.weeklyScores.map((score: number | null, i: number) => (
                  <td key={`score-${i}`} className="week-score">
                    {score !== null ? score : <span className="missed">-</span>}
                  </td>
                ))}
                <td className="total">{entry.totalScore}</td>
                <td className="weeks-completed">{TOTAL_WEEKS - entry.missedWeeks}/6</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="leaderboard-legend">
        <p><strong>Rules:</strong> Missed rounds = 63 strokes penalty. 3+ missed rounds = disqualified from prize.</p>
      </div>
    </div>
  );
};
