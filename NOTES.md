# MyNotes — Project Log

A running record of setup decisions, gotchas, and the reasoning behind them.
Written so that someone else (including future me on a different computer) can
rebuild and understand this project without re-discovering the same problems.

**Project:** MyNotes — a note-taking app for Android
**Started:** September 2026
**Repo:** https://github.com/eggb011/MyNotes

---

## Environment

| Thing | Choice |
|---|---|
| Framework | Expo (React Native) |
| Expo SDK | **57** |
| React Native | 0.86.3 |
| Test device | Google Pixel 9a, via Expo Go from the Play Store |
| Editor | VS Code |
| Storage | AsyncStorage (local cache; Supabase sync planned) |
| Version control | Git + GitHub (account: `eggb011`) |

---

## Decisions and why

### Use Expo, not bare React Native

Expo handles the native build tooling so there's no need for Android Studio or
Xcode. The Expo Go app on the phone loads the project over Wi-Fi from a QR code
and live-reloads on save. For learning, this removes the single biggest source
of setup pain.

### Use the `blank` template

`npx create-expo-app@latest MyNotes --template blank` gives one editable file
(`App.js`) instead of a pre-wired project with dozens of files and a navigation
system already in place. Easier to read the whole thing and understand it.

### Keep the project SDK current — don't pin it

**Current rule: track the latest SDK that Expo Go supports. Do not pin to an
older one.**

The project SDK must match whatever version of Expo Go is installed on the test
phone. That sounds like an argument for pinning, but it isn't, because **Expo Go
auto-updates through the Play Store and cannot be held back.**

How this played out here — both directions in one day:

1. The project was first created on **SDK 57**, the newest at the time. Expo Go
   refused to open it: *"Project is incompatible with this version of Expo Go."*
   SDK 57 had shipped, but the matching Expo Go build wasn't in the store yet.
2. The project was recreated on **SDK 54**, which `create-expo-app` labelled
   *"for learning with Expo Go."* That worked.
3. Later the same day, the Play Store auto-updated Expo Go to **SDK 57**, and it
   then refused to open the SDK 54 project — the identical error, reversed.
4. The project was upgraded to SDK 57. Working again.

**The lesson:** pinning to an older SDK means fighting the store indefinitely, or
asking contributors to sideload old Expo Go builds. Keep the project current and
expect to upgrade when Expo Go does.

The `create-expo-app` "for learning with Expo Go" label is still a useful signal
when starting a *brand new* project — it points at whatever the store currently
has. It is not a reason to stay behind once the store catches up.

### Storage: AsyncStorage as the local cache

Notes are stored on the device with AsyncStorage. Originally this was the only
storage — a single-user note-taker didn't need a backend, and adding one would
have tripled the scope before the basics worked.

**Its role has since changed.** With Supabase coming, AsyncStorage becomes the
local cache and primary read path rather than the only store. See
*Backend — in progress* below.

**Current limit:** notes exist only on this one device. Uninstalling Expo Go or
clearing its data deletes them.

---

## Gotchas — things that broke, and the fix

### Never run `npm audit fix --force`

**What happened:** after installing AsyncStorage, npm printed a vulnerability
warning suggesting `npm audit fix` and `npm audit fix --force`. Running the
`--force` version **downgraded the project a full SDK version**, which
immediately broke Expo Go with a version-mismatch error.

**Fix that worked** (adjust the version number to whatever the project should be
on):

```
npx expo install expo@^57.0.0 --fix
npx expo-doctor
```

Naming the version explicitly forces the core version back where it belongs;
`--fix` realigns every other package to match. `expo-doctor` confirms it's
healthy.

**Rule:** ignore npm's vulnerability warnings in Expo projects. They're almost
always in development-only dependencies that never ship in the app. `--force`
does real damage for no benefit.

### Use `npx expo install`, not `npm install`

For any package added to an Expo project:

```
npx expo install <package-name>
```

`expo install` picks the version compatible with the project's SDK. Plain
`npm install` grabs the newest version, which may not match and can break the
build. Confirmation it worked looks like:
`Installing 1 SDK 57.0.0 compatible native module`.

### Upgrading the SDK

Run in this order:

```
npx expo install expo@^57.0.0
npx expo install --fix
npx expo-doctor
```

On the 54 → 57 upgrade, `expo-doctor` flagged three keys in `app.json` that
SDK 57 no longer recognises: `newArchEnabled`, `splash`, and
`android.edgeToEdgeEnabled`. The first two were switches for behaviour that is
now default; splash screens moved to a separate plugin. Deleting all three
cleared the check (21/21).

React Native jumped 0.81 → 0.86 in the same upgrade. Nothing broke, but a major
React Native version change is the first place to look if something behaves
oddly after an SDK bump.

### The terminal keys: `r` and `s`

Both are **single keypresses made while the Expo server is running** — not
commands you type and press Enter.

**`r` reloads the app.** Saving a file is supposed to trigger an automatic
refresh ("fast refresh"), but it doesn't always fire. `r` forces it. This was the
fix for what looked like a completely broken app more than once.

**`s` toggles between Expo Go and development build.** It does not *select* Expo
Go — read the terminal's last line first. `Using Expo Go` means you're already
right, and pressing `s` will take you out of it.

**If the terminal shows a normal `PS ...>` prompt, the server isn't running** and
these keys do nothing useful. In PowerShell, `r` is a shortcut for "repeat last
command," which can silently re-run something unexpected.

### Two terminals

A terminal running `npx expo start` is **occupied** — it can't accept Git
commands. Either stop the server with Ctrl + C, or open a second terminal
(VS Code: Terminal → New Terminal) and run Git there. Keeping two open
permanently is the normal setup: one for the dev server, one for everything else.

### Verify code actually saved before debugging behaviour

**What happened:** after pasting in the AsyncStorage version of `App.js`, notes
still disappeared on app close. A lot of time went into debugging the storage
logic — but the paste had never taken. The file was still the old version.

Confusingly, the saving and non-saving versions look **identical** on screen, so
visual inspection proved nothing.

**Two techniques that cracked it:**

1. **Search the file for a known string.** `Ctrl + F` in VS Code for
   `AsyncStorage`. "No results" means the code isn't there. Definitive.
2. **Add a visible marker.** Temporarily change the on-screen title to
   `My Notes v2`. If the phone still shows the old title, the new code isn't
   running. Removes all guesswork about stale bundles.

**Rule:** before debugging *why* code misbehaves, confirm the code is actually
present and actually running.

### Long pastes into VS Code can truncate silently

This happened more than once — a pasted file landed only partly, with no error
and no warning. **Always scroll to the bottom of a file after pasting** and
confirm it ends where it should.

### Save before `git add`

Git reads files from disk. An edited-but-unsaved file in VS Code is invisible to
it, so the change silently doesn't get committed.

**Habit:** `Ctrl + S` (or `Ctrl + K` then `S` to save all), then run `git status`
before committing to see exactly what's about to go in. This check would have
caught two separate mistakes here.

### Git "repository not found" usually means wrong account

**What happened:** `git push` failed with `remote: Repository not found` even
though the repo clearly existed on github.com.

The next error was the useful one:
`Permission to eggb011/MyNotes.git denied to e66b011.`

Git was authenticated as a **different account** — `e66b011` (two sixes) instead
of `eggb011` (two g's). GitHub reports "not found" rather than "no permission"
for private repos, to avoid revealing that a private repo exists. So the real
problem (wrong identity) was hidden behind a misleading message.

**Fix:** clear the saved credential and sign in again.

- Windows key → **Credential Manager** → **Windows Credentials**
- Remove any entry starting with `git:https://github.com`
- Run `git push` again; when the sign-in appears, choose the browser option
- **Check the username shown on the GitHub authorization page before approving**

**Rule:** on any push permission error, suspect authentication first, and read
the error for *which* account Git thinks it is.

---

## Commands worth remembering

**Start the dev server**

```
npx expo start
```

Then scan the QR code with Expo Go. Phone and computer must be on the **same
Wi-Fi network**.

**Add a package**

```
npx expo install <package-name>
```

**Health check / repair versions**

```
npx expo-doctor
npx expo install --fix
```

**Check what's actually installed** (rather than what a document claims)

```
npm list expo react-native react --depth=0
```

**Save work to GitHub** (the everyday loop)

```
git add .
git commit -m "short description of what changed"
git push
```

**Check state before committing**

```
git status
git log --oneline -5
```

---

## Open items

- [ ] Pick a next feature: edit a note / confirm before delete / timestamps / search

---

## Backend — in progress

**Goal:** user accounts and note sharing between users.

**Service:** Supabase (hosted Postgres + auth), chosen over a custom server to
avoid writing and hosting an API. Project provisioned September 2026 — **not yet
connected to the app.**

### Architecture: offline-first

AsyncStorage stays, but its role changes. It becomes the **primary read path**,
not a fallback. The app reads local storage immediately and syncs with Supabase
in the background.

**Why:** mobile connectivity is unreliable, and a note-taker that blocks on a
spinner is worse than no app. Notes must appear instantly regardless of network.

**Do not remove AsyncStorage** once Supabase works. It is not redundant — it is
the mechanism that makes the app fast and offline-capable.

**Known deferred problem:** conflict handling when the same note is edited on two
devices. Not solved yet — revisit when it actually occurs.

### Security: automatic RLS enabled

Row Level Security is switched on for all new tables by default, set at project
creation.

**Why:** RLS enforces access rules in the database itself, so a bug in app code
can't leak another user's notes. Enabling per-table by hand means one forgotten
table is a data leak; automatic means it can't be forgotten.

**Expect this:** a new table with RLS on and no policies written allows
*nothing*, including to you. An empty result on a fresh table is RLS working,
not a bug.

### Keys

Supabase issues two keys, and the difference matters:

- **anon / publishable key** — designed to live in the app. Safety comes from
  RLS, not from hiding it. Still kept in `.env` rather than hardcoded.
- **service_role / secret key** — bypasses all RLS. Must never appear in app
  code or the repo. Not needed for anything currently planned.

`.env` is in `.gitignore`. The database password is stored outside the project
folder entirely.

### Deliberately skipped: Supabase GitHub integration

Schema-sync-on-push is a paid feature, and adding automation before a working
schema exists makes failures hard to diagnose. Revisit if manual schema changes
start causing friction between contributors.

### Not built yet

### Build order

1. **Connect to Supabase.** Keys into `.env`, install the client library, run a
   test call. No changes to `App.js` — the goal is only to prove the connection
   works, with nothing else tangled in to confuse a failure.
2. **Split storage out of `App.js`.** Move the AsyncStorage load/save logic into
   its own file. No behaviour change. Done before accounts because auth and
   network sync would make the untangling much harder later.
3. **User accounts.** Login screen; notes belong to a user and live in the
   database. This is where the app changes shape most.
4. **Note sharing.** One user shares a note with another. Depends on step 3.

Currently on step 1.
---

## How to keep this document useful

Update it **in the same session** as the change it describes — not later.
Record the *why*, not just the *what*, because the why is what can't be
recovered by reading the code. If something can't be written up right away,
at least add a one-line placeholder so the gap is visible.

When a decision is superseded, keep the original reasoning and append what
changed. The history of why something was believed, and why that stopped being
true, is usually the useful part.