import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import type { WeeklyRound, Player } from '../types';

// Subscribe to all rounds (real-time)
export function subscribeRounds(cb: (rounds: WeeklyRound[]) => void) {
  const q = query(collection(db, 'rounds'), orderBy('week'));
  const unsub = onSnapshot(q, (snap) => {
    const rounds: WeeklyRound[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(rounds);
  });
  return unsub;
}

// Add or update a round in cloud
export async function submitRoundToCloud(round: WeeklyRound) {
  try {
    const ref = doc(db, 'rounds', round.id);
    await setDoc(ref, round, { merge: true });
  } catch (err) {
    console.error('submitRoundToCloud error', err);
    throw err;
  }
}

export async function createRoundInCloud(partial: Omit<WeeklyRound, 'id'>) {
  try {
    // Use provided id in partial if available in a field; otherwise generate new id
    const ref = doc(collection(db, 'rounds'));
    const roundWithId = { id: ref.id, ...partial };
    await setDoc(ref, roundWithId);
    return roundWithId;
  } catch (err) {
    console.error('createRoundInCloud error', err);
    throw err;
  }
}

// Subscribe to players
export function subscribePlayers(cb: (players: Player[]) => void) {
  const q = query(collection(db, 'players'), orderBy('username'));
  const unsub = onSnapshot(q, (snap) => {
    const players: Player[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(players);
  });
  return unsub;
}

export async function upsertPlayerToCloud(player: Player) {
  try {
    const ref = doc(db, 'players', player.id);
    await setDoc(ref, player, { merge: true });
  } catch (err) {
    console.error('upsertPlayerToCloud error', err);
    throw err;
  }
}

// Weeks management
export function subscribeWeeks(cb: (activeWeeks: number[]) => void) {
  const q = query(collection(db, 'weeks'));
  const unsub = onSnapshot(q, (snap) => {
    const active: number[] = snap.docs
      .filter((d) => (d.data() as any).active)
      .map((d) => Number((d.data() as any).week));
    cb(active);
  });
  return unsub;
}

export async function setWeekActiveInCloud(week: number, active = true) {
  try {
    const ref = doc(db, 'weeks', String(week));
    await setDoc(ref, { week, active }, { merge: true });
  } catch (err) {
    console.error('setWeekActiveInCloud error', err);
    throw err;
  }
}

// Basic helper to fetch a player doc
export async function fetchPlayer(id: string) {
  const ref = doc(db, 'players', id);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Player) : null;
}
