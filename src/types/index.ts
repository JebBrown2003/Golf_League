export interface Player {
  id: string;
  username: string;
  email: string;
  name: string;
  isCommissioner: boolean;
  buyInPaid: boolean;
}

export interface HoleScore {
  holeNumber: number;
  strokes: number;
}

export interface WeeklyRound {
  id: string;
  playerId: string;
  week: number;
  declared: boolean;
  declaredAt?: string;
  holeScores: HoleScore[];
  totalScore: number;
  submitted: boolean;
  submittedAt?: string;
  photoUrl?: string;
  locked: boolean;
}

export interface WeeklyLeaderboard {
  week: number;
  entries: {
    playerId: string;
    username: string;
    totalScore: number;
    submitted: boolean;
    rank: number;
  }[];
}

export interface SeasonLeaderboard {
  entries: {
    playerId: string;
    username: string;
    weeklyScores: (number | null)[];
    totalScore: number;
    missedWeeks: number;
    disqualified: boolean;
    rank: number;
  }[];
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  isCommissioner: boolean;
}
