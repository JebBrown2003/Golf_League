import React, { useState } from 'react';
import { useLeagueStore } from '../store/leagueStore';
import '../styles/Auth.css';

interface RoundDeclarationProps {
  onRoundDeclared: (week: number) => void;
  currentWeek: number;
}

export const RoundDeclaration: React.FC<RoundDeclarationProps> = ({ onRoundDeclared, currentWeek }) => {
  const { currentUser, rounds, declareRound, isWeekActive } = useLeagueStore();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  const weekRound = rounds.find((r) => r.playerId === currentUser?.id && r.week === selectedWeek);
  const isDeclared = weekRound?.declared || false;
  const isWeekStarted = isWeekActive(selectedWeek);

  const handleDeclare = () => {
    if (currentUser) {
      declareRound(currentUser.id, selectedWeek);
      onRoundDeclared(selectedWeek);
    }
  };

  return (
    <div className="round-declaration">
      <h2>Declare Your Round</h2>
      <p className="subtitle">
        You must declare your round before teeing off. Only one declared round per player per week.
      </p>

      <div className="form-group">
        <label htmlFor="week">Select Week</label>
        <select
          id="week"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
        >
          {Array.from({ length: 6 }, (_, i) => i + 1).map((week) => (
            <option key={week} value={week}>
              Week {week} {isWeekActive(week) ? '(Open)' : '(Closed)'}
            </option>
          ))}
        </select>
      </div>

      {!isWeekStarted ? (
        <div className="warning-message">
          <p>⏳ Week {selectedWeek} has not been started by commissioners yet</p>
          <p className="small">Check back soon or contact the commissioners</p>
        </div>
      ) : isDeclared ? (
        <div className="success-message">
          <p>✓ You have declared a round for Week {selectedWeek}</p>
          <p className="small">You can now submit your scores after playing</p>
        </div>
      ) : (
        <button onClick={handleDeclare} className="submit-btn">
          Declare Round for Week {selectedWeek}
        </button>
      )}
    </div>
  );
};
