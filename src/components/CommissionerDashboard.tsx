import React, { useState } from 'react';
import { useLeagueStore } from '../store/leagueStore';
import '../styles/CommissionerDashboard.css';

export const CommissionerDashboard: React.FC = () => {
  const { players, rounds, toggleBuyIn, editScore, lockScore, startWeek, activeWeeks } = useLeagueStore();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [editingRound, setEditingRound] = useState<string | null>(null);
  const [editScores, setEditScores] = useState<{ [hole: number]: number }>({});

  const handleEditClick = (round: any) => {
    setEditingRound(`${round.playerId}-${round.week}`);
    const scoreMap: { [hole: number]: number } = {};
    round.holeScores.forEach((hole: any) => {
      scoreMap[hole.holeNumber] = hole.strokes;
    });
    setEditScores(scoreMap);
  };

  const handleSaveEdit = (playerId: string, week: number) => {
    const holeScores = Array.from({ length: 9 }, (_, i) => ({
      holeNumber: i + 1,
      strokes: editScores[i + 1] || 0,
    }));
    editScore(playerId, week, holeScores);
    setEditingRound(null);
  };

  const handleStartWeek = (week: number) => {
    startWeek(week);
  };

  const weekRounds = rounds.filter((r) => r.week === selectedWeek);

  return (
    <div className="commissioner-dashboard">
      <h2>Commissioner Dashboard</h2>
      <p className="subtitle">Manage weeks, buy-ins, and scores</p>

      <div className="dashboard-section">
        <h3>Week Management</h3>
        <p className="section-subtitle">Start each week to enable player declarations</p>
        <div className="weeks-grid">
          {Array.from({ length: 6 }, (_, i) => i + 1).map((week) => (
            <div key={week} className="week-card">
              <h4>Week {week}</h4>
              {activeWeeks.includes(week) ? (
                <div className="week-status active">✓ ACTIVE</div>
              ) : (
                <>
                  <div className="week-status inactive">INACTIVE</div>
                  <button
                    onClick={() => handleStartWeek(week)}
                    className="start-week-btn"
                  >
                    Start Week {week}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Buy-In Management</h3>
        <table className="management-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Buy-In Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {players.filter((p) => !p.isCommissioner).map((player) => (
              <tr key={player.id}>
                <td>{player.name}</td>
                <td>
                  <span className={`status ${player.buyInPaid ? 'paid' : 'unpaid'}`}>
                    {player.buyInPaid ? '✓ Paid' : '✗ Unpaid'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => toggleBuyIn(player.id)}
                    className={`toggle-btn ${player.buyInPaid ? 'unpaid-btn' : 'paid-btn'}`}
                  >
                    {player.buyInPaid ? 'Mark Unpaid' : 'Mark Paid'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dashboard-section">
        <h3>Score Management - Week {selectedWeek}</h3>

        <div className="week-selector">
          {Array.from({ length: 6 }, (_, i) => i + 1).map((week) => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`week-btn ${selectedWeek === week ? 'active' : ''}`}
            >
              Week {week}
            </button>
          ))}
        </div>

        <table className="management-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Status</th>
              <th>Score</th>
              <th>Locked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.filter((p) => !p.isCommissioner).map((player) => {
              const round = weekRounds.find((r) => r.playerId === player.id);
              const isEditing = editingRound === `${player.id}-${selectedWeek}`;

              return (
                <tr key={player.id}>
                  <td>{player.name}</td>
                  <td>
                    {!round ? (
                      <span className="not-declared">Not Declared</span>
                    ) : round.submitted ? (
                      <span className="submitted">✓ Submitted</span>
                    ) : (
                      <span className="pending">⏳ Pending</span>
                    )}
                  </td>
                  <td>{round?.submitted ? round.totalScore : '-'}</td>
                  <td>{round?.locked ? '🔒' : '🔓'}</td>
                  <td>
                    {round && round.submitted && !isEditing && (
                      <>
                        <button
                          onClick={() => handleEditClick(round)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        {!round.locked && (
                          <button
                            onClick={() => lockScore(player.id, selectedWeek)}
                            className="lock-btn"
                          >
                            Lock
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {editingRound && (
          <div className="edit-modal">
            <div className="edit-content">
              <h4>Edit Scores</h4>
              <div className="edit-holes">
                {Array.from({ length: 9 }, (_, i) => i + 1).map((hole) => (
                  <div key={hole} className="edit-hole">
                    <label>Hole {hole}</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={editScores[hole] || 0}
                      onChange={(e) =>
                        setEditScores({
                          ...editScores,
                          [hole]: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="edit-total">
                Total: {Object.values(editScores).reduce((a, b) => a + b, 0)}
              </div>
              <div className="edit-buttons">
                <button
                  onClick={() => {
                    const [playerId, week] = editingRound.split('-');
                    handleSaveEdit(playerId, parseInt(week));
                  }}
                  className="save-btn"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingRound(null)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
