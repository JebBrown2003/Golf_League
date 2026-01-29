import type { WeeklyRound } from '../types';

const MISSED_ROUND_PENALTY = 63;
const TOTAL_WEEKS = 6;
const DISQUALIFICATION_MISSED_WEEKS = 3;

// Calculate total score for a round
export const calculateRoundTotal = (holeScores: { holeNumber: number; strokes: number }[]): number => {
  return holeScores.reduce((sum, hole) => sum + hole.strokes, 0);
};

// Get season total score for a player
export const calculateSeasonTotal = (rounds: WeeklyRound[], totalWeeks: number): number => {
  let total = 0;
  for (let week = 1; week <= totalWeeks; week++) {
    const round = rounds.find((r) => r.week === week);
    if (!round || !round.submitted) {
      total += MISSED_ROUND_PENALTY;
    } else {
      total += round.totalScore;
    }
  }
  return total;
};

// Count missed weeks
export const countMissedWeeks = (rounds: WeeklyRound[], totalWeeks: number): number => {
  let missed = 0;
  for (let week = 1; week <= totalWeeks; week++) {
    const round = rounds.find((r) => r.week === week);
    if (!round || !round.submitted) {
      missed++;
    }
  }
  return missed;
};

// Check if player is disqualified
export const isPlayerDisqualified = (rounds: WeeklyRound[]): boolean => {
  return countMissedWeeks(rounds, TOTAL_WEEKS) > DISQUALIFICATION_MISSED_WEEKS;
};

// Get weekly scores for season leaderboard
export const getWeeklyScoresArray = (rounds: WeeklyRound[]): (number | null)[] => {
  const scores: (number | null)[] = [];
  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const round = rounds.find((r) => r.week === week);
    scores.push(round && round.submitted ? round.totalScore : null);
  }
  return scores;
};

// Check if deadline has passed for a week
export const isSubmissionDeadlinePassed = (): boolean => {
  const now = new Date();
  
  // Find the next Sunday 11:59 PM for the given week
  // This is simplified - in production you'd calculate based on season start date
  const sundayOfWeek = new Date();
  sundayOfWeek.setDate(sundayOfWeek.getDate() + (7 - sundayOfWeek.getDay()));
  sundayOfWeek.setHours(23, 59, 59, 999);
  
  return now > sundayOfWeek;
};

