# Contributing to MyNotes

We're a small team — currently two people, with roles still being worked out.
This document is deliberately light. It covers the few things that prevent
actual problems, and leaves everything else open until we know how we work
together.

Expect this to change. When it does, update it in the same session as the
change, and record *why* it changed.

---

## Before you start

Read `README.md` to get the project running, and `CODE_WALKTHROUGH.md` to
understand `App.js`. Both are short.

## Never commit secrets

This is the one hard rule.

**Do not commit API keys, passwords, tokens, or credentials — ever.** Once
something is pushed, it's in the repo history even if you delete it in a later
commit. Removing it properly is genuinely painful, and on a public repo it has
to be treated as leaked and rotated.

Secrets belong in a `.env` file, which `.gitignore` excludes from the repo.
When the backend arrives, `.env` will hold the Supabase keys. Each person keeps
their own local copy; it's never pushed.

If you add a new secret, add a placeholder line to `.env.example` (which *is*
committed) so the other person knows a value is needed without learning what it
is.

**If a secret gets committed by accident:** say so immediately rather than
quietly deleting it. It needs to be rotated, and that's a five-minute
conversation instead of a silent vulnerability.

---

## Working on the code

### Use a branch

Don't commit directly to `main`. Make a branch for whatever you're working on:

```
git checkout -b add-note-editing
```

`checkout -b` creates the branch and switches to it. Name it after what you're
doing — `add-search`, `fix-delete-button`.

Work on it, commit as you go:

```
git add .
git commit -m "Add edit mode to note rows"
git push -u origin add-note-editing
```

The `-u origin <branch>` part is needed the first time you push a new branch.
After that, plain `git push` works.

**Why bother with branches at all:** `main` stays in a known-working state, and
two people can work at the same time without overwriting each other. With one
contributor this feels like overhead. It stops feeling that way the first time
two changes collide.

### Then open a pull request

Push your branch, then on GitHub click **Compare & pull request**. Write a
sentence or two on what changed and why.

Right now, **either person can merge their own PR** — we're not requiring
review, because with two people and undefined roles that would just be a
bottleneck. The PR exists so the other person can *see* what changed, not to
gate it. If we later decide review is worth it, we'll change this and note why.

### Before you push, check it runs

Load the app on a real phone through Expo Go and confirm the thing you changed
works and nothing obvious broke. There are no automated tests yet, so this is
the only safety net.

---

## Commit messages

One logical change per commit, with a message saying what changed:

- Good: `Add confirmation dialog before deleting a note`
- Good: `Fix input box being covered by keyboard`
- Not useful: `updates`, `fix`, `stuff`

Commit often. Small commits are cheap and make it easy to rewind one thing
without losing the rest.

---

## Keeping documentation true

The project has four documents, and they only stay useful if they stay accurate:

| File | Covers |
|---|---|
| `README.md` | setup, running the app, project structure |
| `NOTES.md` | decisions, why they were made, gotchas already hit |
| `CODE_WALKTHROUGH.md` | how `App.js` works |
| `CONTRIBUTING.md` | this — how we work together |

**Update the affected document in the same change that makes it out of date.**
Not later. Documentation that has drifted is worse than none, because people
stop trusting it and then stop reading it.

Specifically:

- Change how the app is built or structured → update `CODE_WALKTHROUGH.md`
- Make a decision, or hit and solve a new problem → add it to `NOTES.md`, with
  the reasoning
- Change setup steps or dependencies → update `README.md`
- Change how we work → update this file

Capture the **why**, not just the what. The what is recoverable by reading the
code; the why isn't.

If there isn't time to write it up properly, add a one-line placeholder to
`NOTES.md` so the gap is visible rather than silently forgotten.

---

## Things we haven't decided

Recorded so it's clear these are open, not overlooked:

- Who owns what — roles are undetermined
- Whether PRs will require review
- Branch protection on `main`
- Automated tests
- Whether the app gets published to the Play Store

None of these need answering to keep building. Revisit when they start causing
friction.