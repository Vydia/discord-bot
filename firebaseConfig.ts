import invariant from 'invariant'

// DW devz environment sets DATABASE_URL to the devz database. Do a quick sanity check for that.
// Invariant: DATABASE_URL does not include "postgres" in the URL.
invariant(
  !(process.env.DATABASE_URL ?? '').includes('postgres'),
  'DATABASE_URL should not include "postgres" in the URL. This probably means your DancingWind is messing it up. Check your shell profile and comment out DATABASE_URL, or override like `DATABASE_URL="https://discord-watch-default-rtdb.firebaseio.com" yarn dev`'
)

export const config = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId,
}
