---
layout: post
title: "🔧 Git Tips Every Developer Should Know"
date: 2026-04-09
categories: [git, productivity]
tags: [git, cli, version-control, tips, workflow]
author: Valeras Narbutas
reading_time: 5
excerpt: "Git is the one tool every developer uses daily, yet most only use 10% of it. These are the tips that actually matter."
---

# 🔧 Git Tips Every Developer Should Know

> **Author:** [@ValerasNarbutas](https://github.com/ValerasNarbutas) · **Tags:** `git` `productivity` · **Reading time:** ~5 min

---

Git is the one tool that every developer touches every day, yet most only use 10% of it. These are the tips that actually matter.

## 1. Amend Without Opening an Editor

Made a typo in your last commit message? One flag fixes it:

```bash
git commit --amend --no-edit
```

Add `--no-edit` to reuse the existing message. Great for adding a forgotten file to the last commit.

```bash
git add forgotten-file.ts
git commit --amend --no-edit
```

> ⚠️ Only do this on commits you haven't pushed yet.

---

## 2. Stash with a Message

`git stash` is commonly used but rarely named. Named stashes are much easier to work with later:

```bash
git stash push -m "WIP: refactor auth middleware"
```

List all stashes:

```bash
git stash list
# stash@{0}: On feature/auth: WIP: refactor auth middleware
# stash@{1}: On main: hotfix idea
```

Apply a specific stash without dropping it:

```bash
git stash apply stash@{1}
```

---

## 3. Interactive Rebase to Clean Up History

Before merging a feature branch, clean up your commit history with interactive rebase:

```bash
git rebase -i HEAD~5   # rewrite last 5 commits
```

In the editor, use:
- `pick` — keep as-is
- `squash` / `s` — merge into the previous commit
- `reword` / `r` — change commit message
- `fixup` / `f` — like squash, but discard this commit's message
- `drop` / `d` — delete the commit entirely

Clean history makes code review easier and `git blame` more useful.

---

## 4. Find the Commit That Introduced a Bug

`git bisect` does a binary search through your commit history:

```bash
git bisect start
git bisect bad                  # current commit is broken
git bisect good v2.1.0          # this tag was working

# Git checks out a midpoint commit — test it, then:
git bisect good   # or: git bisect bad

# Repeat until Git identifies the culprit commit
git bisect reset  # when done
```

This finds bugs in large histories in ~log₂(n) steps.

---

## 5. Use `--patch` for Surgical Staging

Don't commit everything in a file — stage only the hunks you want:

```bash
git add --patch
# or shorthand:
git add -p
```

Git shows each changed hunk and asks what to do: `y` (stage), `n` (skip), `s` (split), `e` (edit manually).

Pair this with `git diff --staged` to review exactly what you're about to commit.

---

## 6. Useful Aliases Worth Adding

```ini
# ~/.gitconfig
[alias]
  st   = status -sb
  lg   = log --oneline --graph --decorate --all
  undo = reset HEAD~1 --soft
  wip  = commit -am "WIP"
  unwip = reset HEAD~1 --soft
```

`git lg` gives a compact visual branch graph. `git undo` rolls back the last commit while keeping your changes staged.

---

## 7. Don't Fear `reflog`

`git reflog` is your undo history for Git operations. Even after a bad rebase or accidental branch deletion, you can recover:

```bash
git reflog
# HEAD@{0}: rebase: finish
# HEAD@{1}: commit: add login form
# HEAD@{2}: checkout: moving from main to feature/login
# ...

git checkout HEAD@{2}   # go back to any state
```

Your local reflog is kept for 90 days by default. It has saved many developers from disaster.

---

## Summary

| Tip | Command |
|-----|---------|
| Amend last commit | `git commit --amend --no-edit` |
| Named stash | `git stash push -m "description"` |
| Clean history | `git rebase -i HEAD~N` |
| Find bug commit | `git bisect start/good/bad` |
| Stage by hunk | `git add -p` |
| Recover anything | `git reflog` |

Git rewards investment. The more you learn it, the less time you spend fighting it.

---

[← Back to homepage](../index.md)
