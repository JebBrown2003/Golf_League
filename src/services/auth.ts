import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import type { Player } from '../types';
import { upsertPlayerToCloud } from './firestore';

export async function signUp(email: string, password: string, username: string, name: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  const player: Player = {
    id: user.uid,
    username,
    email,
    name,
    isCommissioner: false,
    buyInPaid: false,
  };

  // create player doc
  await upsertPlayerToCloud(player);
  return user;
}

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function fetchPlayerDoc(uid: string): Promise<Player | null> {
  const ref = doc(db, 'players', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Player) : null;
}
