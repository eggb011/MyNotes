# MyNotes

A note-taking app for Android, built with Expo (React Native).

Notes are typed in, listed newest-first, and saved to the device so they survive
closing the app. Long-press a note to delete it.

**Status:** working single-user app. Notes are stored locally on one device only
— no accounts, no sync. A Supabase backend has been provisioned but is not yet
connected.

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

---

## Things that will save you time

**If saving a file doesn't refresh the phone:** click into the terminal running
`npx expo start` and press **`r`**. It's a single keypress, not a typed command,
and it forces a reload. Needed more often than you'd expect.

**Read the terminal's last line before pressing `s`.** `s` *toggles* between Expo
Go and development build — it doesn't select Expo Go. If it already says
`Using Expo Go`, pressing `s` will take you out of it.

**Keep two terminals open.** One runs the dev server (it's occupied and can't
take Git commands), one is free for everything else. VS Code: Terminal → New
Terminal.

**Never run `npm audit fix --force`.** npm suggests it after showing
vulnerability warnings. It downgrades the Expo SDK and breaks the app. The
warnings are safe to ignore — they're in development-only dependencies that never
ship. See `NOTES.md` for recovery steps if it happens.

**Save files before `git add`.** Git reads from disk, so an unsaved editor buffer
won't be committed. `git status` before committing shows what's actually staged.

---

## Project structure

```
App.js                 the entire app — UI, state, and storage
app.json               Expo configuration
package.json           dependencies and scripts
.gitignore             files Git ignores (node_modules, .env secrets)
README.md              this file
NOTES.md               setup decisions, gotchas, and why things are as they are
CODE_WALKTHROUGH.md    annotated tour of App.js
CONTRIBUTING.md        how we work together on this
```

`App.js` is currently the whole app in one file. That's deliberate for now — it's
small enough to hold in your head. It will get split up as it grows, starting
with the storage logic before Supabase lands.

## Read before changing code

**`CODE_WALKTHROUGH.md`** explains how `App.js` works — state, the save/load
effects, and where to plug new things in. Worth reading first; it covers a few
non-obvious details, like why the `loaded` flag exists and why saving lives in
its own effect rather than inside the add/delete functions.

**`NOTES.md`** records setup decisions and the problems already hit. Check it
before debugging anything environment-related.

**`CONTRIBUTING.md`** covers the branch and commit workflow, and the rule about
never committing secrets.

---

## Tech

| | |
|---|---|
| Framework | Expo (React Native) |
| Expo SDK | 57 — keep current with Expo Go, see `NOTES.md` |
| React Native | 0.86.3 |
| Storage | AsyncStorage (local cache; Supabase sync planned) |
| Test device | Google Pixel 9a via Expo Go |

**On the SDK version:** don't pin this to an older release. Expo Go auto-updates
through the Play Store and can't be held back, so the project has to keep pace.
`NOTES.md` has the full story — it broke in both directions on the same day.

---

## Where this is heading

**Next:** user accounts and note sharing between users, backed by Supabase
(hosted Postgres + auth). The Supabase project exists; connecting it to the app
is the current work.

The architecture is **offline-first** — AsyncStorage stays as a local cache and
remains the primary read path, with syncing to Supabase in the background, so
notes appear instantly regardless of network conditions.

**Don't remove AsyncStorage once Supabase works.** It will look redundant. It
isn't — it's what makes the app fast and usable offline.

Row Level Security is enabled by default on all Supabase tables, so access rules
are enforced by the database rather than trusted to app code.

See `NOTES.md` for the reasoning behind all of these choices.