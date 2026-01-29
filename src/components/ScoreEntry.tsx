import React, { useState } from 'react';
import { useLeagueStore } from '../store/leagueStore';
import '../styles/ScoreEntry.css';

interface ScoreEntryProps {
  onSubmit: (week: number) => void;
}

export const ScoreEntry: React.FC<ScoreEntryProps> = ({ onSubmit }) => {
  const { currentUser, rounds, submitRound } = useLeagueStore();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [scores, setScores] = useState<{ [hole: number]: number }>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const weekRound = rounds.find((r) => r.playerId === currentUser?.id && r.week === selectedWeek);
  const isAlreadySubmitted = weekRound?.submitted || false;

  const handleScoreChange = (hole: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    if (numValue >= 0 && numValue <= 20) {
      setScores({ ...scores, [hole]: numValue });
    }
  };

  const allHolesFilled = Object.values(scores).every((score) => score > 0);

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allHolesFilled) {
      alert('Please fill in all hole scores before submitting.');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    if (!currentUser) return;

    const allScores = Array.from({ length: 9 }, (_, i) => ({
      holeNumber: i + 1,
      strokes: scores[i + 1] || 0,
    }));

    submitRound(currentUser.id, selectedWeek, allScores, photoUrl || undefined);
    setSubmitted(true);
    setShowConfirmation(false);
    setTimeout(() => {
      onSubmit(selectedWeek);
    }, 1000);
  };

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  if (!weekRound?.declared) {
    return (
      <div className="score-entry">
        <div className="warning-message">
          Please declare your round for Week {selectedWeek} before submitting scores.
        </div>
      </div>
    );
  }

  if (isAlreadySubmitted) {
    return (
      <div className="score-entry">
        <div className="success-message">
          <p>✓ Scores already submitted for Week {selectedWeek}</p>
          <p className="small">Total: {weekRound.totalScore} strokes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="score-entry">
      <h2>Submit Your Scores - Week {selectedWeek}</h2>

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

      <form onSubmit={handleSubmitClick} className="score-form">
        <div className="holes-grid">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((hole) => (
            <div key={hole} className="hole-input">
              <label htmlFor={`hole-${hole}`}>Hole {hole}</label>
              <input
                id={`hole-${hole}`}
                type="number"
                min="0"
                max="20"
                value={scores[hole]}
                onChange={(e) => handleScoreChange(hole, e.target.value)}
                required
              />
            </div>
          ))}
        </div>

        <div className="total-section">
          <h3>9-Hole Total: <span className="total-score">{totalScore}</span> strokes</h3>
        </div>

        <div className="form-group">
          <label htmlFor="photoUrl">Scorecard Photo URL (optional)</label>
          <input
            id="photoUrl"
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://example.com/scorecard.jpg"
          />
          <p className="hint">Upload a photo of your scorecard for transparency</p>
        </div>

        {submitted && (
          <div className="success-message">
            <p>✓ Scores submitted successfully!</p>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={submitted || !allHolesFilled}>
          Submit Scores
        </button>
      </form>

      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>Confirm Score Submission</h3>
            <p>You are about to submit your scores for <strong>Week {selectedWeek}</strong></p>
            <div className="score-preview">
              <p><strong>Your Total Score: {totalScore} strokes</strong></p>
              <div className="score-breakdown">
                {Array.from({ length: 9 }, (_, i) => i + 1).map((hole) => (
                  <span key={hole} className="hole-preview">H{hole}: {scores[hole]}</span>
                ))}
              </div>
            </div>
            <p className="confirmation-warning">Are you sure? This cannot be changed.</p>
            <div className="confirmation-buttons">
              <button onClick={handleConfirmSubmit} className="confirm-btn">
                Confirm & Submit
              </button>
              <button onClick={() => setShowConfirmation(false)} className="cancel-confirm-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="deadline-info">
        <p className="deadline">⏰ Deadline: Sunday 11:59 PM</p>
      </div>
    </div>
  );
};
