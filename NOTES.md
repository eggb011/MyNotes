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
| Expo SDK | **54** |
| Test device | Google Pixel 9a, via Expo Go from the Play Store |
| Editor | VS Code |
| Storage | AsyncStorage (on-device, local only) |
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

### Pin to SDK 54 — **this one matters**

The project SDK version must match what the installed Expo Go supports.

When the project was first created on **SDK 57** (the newest at the time), Expo Go
refused to open it: *"Project is incompatible with this version of Expo Go."*
SDK 57 had shipped, but the matching Expo Go build wasn't in the Play Store yet.

The `create-expo-app` menu labels one option **"for learning with Expo Go"** —
that label is the reliable signal. It was SDK 54. Pick that one.

**Rule:** when starting a new Expo project for Expo Go, choose the SDK version
the menu marks as the Expo Go learning option, not the newest.

### Storage: AsyncStorage, on-device only

Notes persist locally on the phone. No account, no sync, no server. This is
deliberate — a single-user note-taker doesn't need a backend, and adding one
would have tripled the scope before the basics worked.

**Known limit:** notes exist only on this one device. Uninstalling Expo Go or
clearing its data deletes them.

---

## Gotchas — things that broke, and the fix

### Never run `npm audit fix --force`

**What happened:** after installing AsyncStorage, npm printed a vulnerability
warning suggesting `npm audit fix` and `npm audit fix --force`. Running the
`--force` version **downgraded the project from SDK 54 to SDK 53**, which
immediately broke Expo Go with a version-mismatch error.

**Fix that worked:**

```
npx expo install expo@^54.0.0 --fix
npx expo-doctor
```

Naming the version explicitly (`expo@^54.0.0`) forces the core version back up;
`--fix` realigns everything else to match. `expo-doctor` confirms it's healthy.

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
build. Confirmation it worked correctly looks like:
`Installing 1 SDK 54.0.0 compatible native module`.

### Press `r` to force a reload

Saving a file is supposed to trigger an automatic refresh on the phone
("fast refresh"). It doesn't always fire.

**Fix:** click into the terminal running `npx expo start` and press the **`r`**
key. This forces a reload. Shaking the phone also opens a dev menu with a
Reload option.

This was the fix for what looked like a completely broken app more than once.

### Verify code actually saved before debugging behaviour

**What happened:** after pasting in the AsyncStorage version of `App.js`, notes
still disappeared on app close. A lot of time went into debugging the storage
logic — but the paste had never taken. The file was still the old version.

Confusingly, the saving and non-saving versions look **identical** on screen, so
visual inspection proved nothing.

**Two techniques that cracked it:**

1. **Search the file for a known string.** `Ctrl + F` in VS Code for
   `AsyncStorage`. "No results" = the code isn't there. Definitive.
2. **Add a visible marker.** Temporarily change the on-screen title to
   `My Notes v2`. If the phone still shows the old title, the new code isn't
   running. Removes all guesswork about stale bundles.

**Rule:** before debugging *why* code misbehaves, confirm the code is actually
present and actually running.

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

**Save work to GitHub** (the everyday three-command loop)

```
git add .
git commit -m "short description of what changed"
git push
```

---

## Open items

- [ ] Revert the debug title `My Notes v2` back to `My Notes`
- [ ] Remove the `console.log('Saving notes:', notes.length)` debug line
- [ ] Pick a next feature: edit a note / confirm before delete / timestamps / search

## Later — backend

**Goal:** user accounts and sharing notes with other users. This requires a
server-side database and authentication, which AsyncStorage can't provide.

**Direction chosen:** a hosted backend service (**Supabase** or Firebase) rather
than writing a custom server. These provide a database plus login out of the box,
which is a much smaller step than building and hosting an API.

**Deliberately deferred.** The reason is known and concrete, but this is a
significant jump in complexity and deserves its own focused effort rather than
being bolted onto the current app.

---

## How to keep this document useful

Update it **in the same session** as the change it describes — not later.
Record the *why*, not just the *what*, because the why is what can't be
recovered by reading the code. If something can't be written up right away,
at least add a one-line placeholder so the gap is visible.