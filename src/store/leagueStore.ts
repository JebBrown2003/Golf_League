import { create } from 'zustand';
import type { Player, WeeklyRound, AuthUser } from '../types';
import { calculateRoundTotal } from '../utils/scoring';
import {
  submitRoundToCloud,
  upsertPlayerToCloud,
  setWeekActiveInCloud,
} from '../services/firestore';

interface LeagueState {
  // Auth
  currentUser: AuthUser | null;
  players: Player[];
  
  // Rounds
  rounds: WeeklyRound[];
  
  // Week management
  activeWeeks: number[];
  
  // Auth actions
  login: (username: string, password: string) => boolean;
  register: (username: string, email: string, name: string, password: string) => boolean;
  logout: () => void;
  
  // Player actions
  addPlayer: (username: string, email: string, name: string, password: string, isCommissioner?: boolean) => void;
  toggleBuyIn: (playerId: string) => void;
  
  // Round actions
  declareRound: (playerId: string, week: number) => void;
  submitRound: (playerId: string, week: number, holeScores: { holeNumber: number; strokes: number }[], photoUrl?: string) => void;
  updateRound: (playerId: string, week: number, holeScores: { holeNumber: number; strokes: number }[]) => void;
  
  // Commissioner actions
  editScore: (playerId: string, week: number, holeScores: { holeNumber: number; strokes: number }[]) => void;
  lockScore: (playerId: string, week: number) => void;
  startWeek: (week: number) => void;
  
  // Utility
  isWeekActive: (week: number) => boolean;
}

// Simple in-memory authentication (in production, use a backend)
const users: { [username: string]: { password: string; email: string; name: string; id: string } } = {
  alex: { password: 'alex123', email: 'alex@example.com', name: 'Alex', id: 'user-alex' },
  jeb: { password: 'jeb123', email: 'jeb@example.com', name: 'Jeb', id: 'user-jeb' },
};

export const useLeagueStore = create<LeagueState>((set, get) => ({
  currentUser: null,
  players: [
    { id: 'user-alex', username: 'alex', email: 'alex@example.com', name: 'Alex', isCommissioner: true, buyInPaid: true },
    { id: 'user-jeb', username: 'jeb', email: 'jeb@example.com', name: 'Jeb', isCommissioner: true, buyInPaid: true },
  ],
  rounds: [],
  activeWeeks: [],

  login: (username: string, password: string) => {
    const user = users[username];
    if (user && user.password === password) {
      const player = get().players.find((p) => p.username === username);
      if (player) {
        set({
          currentUser: {
            id: player.id,
            username: player.username,
            email: player.email,
            isCommissioner: player.isCommissioner,
          },
        });
        return true;
      }
    }
    return false;
  },

  register: (username: string, email: string, name: string, password: string) => {
    if (users[username] || get().players.find((p) => p.username === username)) {
      return false;
    }
    const newId = `user-${username}`;
    users[username] = { password, email, name, id: newId };
    set((state) => ({
      players: [
        ...state.players,
        {
          id: newId,
          username,
          email,
          name,
          isCommissioner: false,
          buyInPaid: false,
        },
      ],
    }));
    // Auto-login after registration
    set({
      currentUser: {
        id: newId,
        username,
        email,
        isCommissioner: false,
      },
    });
    return true;
  },

  logout: () => {
    set({ currentUser: null });
  },

  addPlayer: (username: string, email: string, name: string, password: string, isCommissioner = false) => {
    const newId = `user-${username}`;
    users[username] = { password, email, name, id: newId };
    const player = {
      id: newId,
      username,
      email,
      name,
      isCommissioner,
      buyInPaid: false,
    };
    set((state) => ({ players: [...state.players, player] }));

    // persist to Firestore
    upsertPlayerToCloud(player).catch((err) => {
      console.warn('Failed to upsert player to Firestore', err);
    });
  },

  toggleBuyIn: (playerId: string) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, buyInPaid: !p.buyInPaid } : p
      ),
    }));
  },

  declareRound: (playerId: string, week: number) => {
    set((state) => {
      const existing = state.rounds.find((r) => r.playerId === playerId && r.week === week);
      if (existing) {
        return state;
      }
      const newRound = {
        id: `round-${playerId}-${week}`,
        playerId,
        week,
        declared: true,
        declaredAt: new Date().toISOString(),
        holeScores: Array.from({ length: 9 }, (_, i) => ({
          holeNumber: i + 1,
          strokes: 0,
        })),
        totalScore: 0,
        submitted: false,
        locked: false,
      };

      // optimistic local update
      set({ rounds: [...state.rounds, newRound] });

      // persist to Firestore (best-effort)
      submitRoundToCloud(newRound).catch((err) => {
        console.warn('Failed to create round in Firestore', err);
      });

      return state;
    });
  },

  submitRound: (playerId: string, week: number, holeScores: { holeNumber: number; strokes: number }[], photoUrl?: string) => {
    set((state) => {
      const total = calculateRoundTotal(holeScores);
      const updated = state.rounds.map((r) =>
        r.playerId === playerId && r.week === week
          ? {
              ...r,
              holeScores,
              totalScore: total,
              submitted: true,
              submittedAt: new Date().toISOString(),
              photoUrl,
              locked: true,
            }
          : r
      );

      // Persist to Firestore (best-effort)
      const updatedRound = updated.find((r) => r.playerId === playerId && r.week === week);
      if (updatedRound) {
        submitRoundToCloud(updatedRound as WeeklyRound).catch((err) => {
          console.warn('Failed to submit round to Firestore', err);
        });
      }

      return { rounds: updated };
    });
  },

  updateRound: (playerId: string, week: number, holeScores: { holeNumber: number; strokes: number }[]) => {
    set((state) => {
      const total = calculateRoundTotal(holeScores);
      return {
        rounds: state.rounds.map((r) =>
          r.playerId === playerId && r.week === week
            ? {
                ...r,
                holeScores,
                totalScore: total,
              }
            : r
        ),
      };
    });
  },

  editScore: (playerId: string, week: number, holeScores: { holeNumber: number; strokes: number }[]) => {
    set((state) => {
      const total = calculateRoundTotal(holeScores);
      return {
        rounds: state.rounds.map((r) =>
          r.playerId === playerId && r.week === week
            ? {
                ...r,
                holeScores,
                totalScore: total,
              }
            : r
        ),
      };
    });
  },

  lockScore: (playerId: string, week: number) => {
    set((state) => ({
      rounds: state.rounds.map((r) =>
        r.playerId === playerId && r.week === week
          ? { ...r, locked: true }
          : r
      ),
    }));
  },

  startWeek: (week: number) => {
    set((state) => {
      if (!state.activeWeeks.includes(week)) {
        const updated = { activeWeeks: [...state.activeWeeks, week] };

        // persist week active to Firestore
        setWeekActiveInCloud(week, true).catch((err) => {
          console.warn('Failed to activate week in Firestore', err);
        });

        return updated;
      }
      return state;
    });
  },

  isWeekActive: (week: number) => {
    return get().activeWeeks.includes(week);
  },
}));
