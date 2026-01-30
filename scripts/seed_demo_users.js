/*
Script to seed demo users (alex and jeb) and create player docs in Firestore.
Requires Firebase Admin SDK and a service account JSON pointed by GOOGLE_APPLICATION_CREDENTIALS.

Usage:
  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
  node scripts/seed_demo_users.js
*/

const admin = require('firebase-admin');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Please set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON');
  process.exit(1);
}

admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore();

async function ensureUser(email, password, username, name, isCommissioner = false) {
  try {
    // Create user if not exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('User exists:', email);
    } catch (e) {
      userRecord = await auth.createUser({ email, password, displayName: name });
      console.log('Created user:', email);
    }

    const playerDoc = db.collection('players').doc(userRecord.uid);
    await playerDoc.set({
      id: userRecord.uid,
      username,
      email,
      name,
      isCommissioner,
      buyInPaid: true,
    }, { merge: true });
    console.log('Upserted player doc for', email);
  } catch (err) {
    console.error('Error seeding user', email, err);
  }
}

(async () => {
  await ensureUser('alex@example.com', 'alex123', 'alex', 'Alex', true);
  await ensureUser('jeb@example.com', 'jeb123', 'jeb', 'Jeb', true);
  console.log('Seeding complete');
  process.exit(0);
})();
