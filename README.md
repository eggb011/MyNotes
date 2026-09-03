# MyNotes

A note-taking app for Android, built with Expo (React Native).

Notes are typed in, listed newest-first, and saved to the device so they
survive closing the app. Long-press a note to delete it.

**Status:** working single-user app. Notes are stored locally on one device
only — no accounts, no sync, no server yet.

---

## Getting set up

You need [Node.js](https://nodejs.org) (LTS version) and a code editor —
[VS Code](https://code.visualstudio.com) is what we use. On your phone, install
**Expo Go** from the Play Store.

Then:

```
git clone https://github.com/eggb011/MyNotes.git
cd MyNotes
npm install
```

`npm install` downloads the packages the project depends on. These aren't stored
in the repo (they're large and reproducible), so this step is required on a
fresh clone.

## Running it

```
npx expo start
```

A QR code appears in the terminal. Scan it with the Expo Go app on your phone.

**Your phone and computer must be on the same Wi-Fi network** — this is the most
common reason it fails to connect.

The first load takes 30–60 seconds while it builds. After that, saving a file
usually refreshes the phone automatically.

## Two things that will save you time

**If saving a file doesn't refresh the phone:** click into the terminal running
`npx expo start` and press **`r`**. This forces a reload. It's needed more often
than you'd expect.

**Never run `npm audit fix --force`.** npm suggests it after showing
vulnerability warnings. It downgrades the Expo SDK and breaks the app. The
warnings are safe to ignore — they're in development-only dependencies that
never ship. See `NOTES.md` for the recovery steps if it happens.

---

## Project structure

```
App.js                 the entire app — UI, state, and storage
package.json           dependencies and scripts
.gitignore             files Git ignores (node_modules, secrets)
NOTES.md               setup decisions, gotchas, and why things are as they are
CODE_WALKTHROUGH.md    annotated tour of App.js
CONTRIBUTING.md        how we work together on this
```

`App.js` is currently the whole app in one file. That's deliberate for now —
it's small enough to hold in your head. It will get split into components as it
grows.

## Read before changing code

**`CODE_WALKTHROUGH.md`** explains how `App.js` works — state, the save/load
effects, and where to plug new things in. Worth reading first; it covers a few
non-obvious details, like why the `loaded` flag exists and why saving lives in
its own effect rather than inside the add/delete functions.

**`NOTES.md`** records setup decisions and the problems we've already hit. Check
it before debugging anything environment-related.

**`CONTRIBUTING.md`** covers the branch and commit workflow.

---

## Tech

| | |
|---|---|
| Framework | Expo (React Native) |
| Expo SDK | 54 — pinned to match Play Store Expo Go, see `NOTES.md` |
| Storage | AsyncStorage (device-local) |
| Test device | Google Pixel 9a via Expo Go |

## Where this is heading

**Next:** a backend providing user accounts and note sharing between users.
Planned approach is a hosted service (Supabase) rather than a custom server.
This is not built yet — see `NOTES.md` for the reasoning.