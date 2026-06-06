---
name: release
description: Cut a release of eleventy-plugin-techdoc — validate the version argument, tag vX.Y.Z, push the tag to trigger the Shipwright OIDC npm publish, then monitor the release workflow to completion and fix any failure. Use when the user asks to release, cut a release, tag a version, publish to npm, or ship.
disable-model-invocation: true
---

# Release

Tag the given version, push the tag, and monitor the GitHub Actions release workflow to completion.

> **Repo context.** `eleventy-plugin-techdoc` publishes to **npm** via a tag-triggered Shipwright pipeline (`.github/workflows/release.yml`, job `publish`, environment `NPM Deployment`). The workflow fires when you push a tag matching `v[0-9]+.[0-9]+.[0-9]+` (stable → npm `latest`) or `v[0-9]+.[0-9]+.[0-9]+-*` (prerelease → npm `beta`). Source always carries version `0.0.0-dev`; the workflow stamps the real version from the tag into `package.json` + `shipwright.json` **in the runner working tree only — never committed**. Publishing uses npm **Trusted Publisher OIDC** (`--provenance`, no `NPM_TOKEN`). Before publishing, the workflow gates on `node bin/init.js --version` equalling `eleventy-plugin-techdoc <version>`.

## Arguments

- `<version>` (required) — the semver to release, e.g. `1.2.3` or `1.2.3-beta.1`. A leading `v` is accepted and stripped. If no version is given, **stop and ask for one — never guess a version.**

## Steps

### 1. Validate the version (hard stop on failure)

- Strip any leading `v`. It MUST match `^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$`. If it doesn't, stop and report.
- The tag to create is `v<version>`.

### 2. Pre-flight — WARN, then proceed only on confirmation

Run `git fetch origin` first, then evaluate these three conditions:

1. **Branch is not `main`** — `git branch --show-current` != `main`.
2. **Uncommitted changes** — `git status --porcelain` is non-empty.
3. **Unpushed commits** — `git rev-list --count @{u}..HEAD` > 0 (or no upstream is set).

If ANY are true, **STOP and warn the user**, listing exactly which condition(s) tripped, e.g.:

```
⚠️  Release pre-flight warning:
  - You are on branch 'fix/foo', not 'main'.
  - You have uncommitted changes (3 files).
  - You have 2 commits not pushed to origin.

Releasing from this state tags whatever is in your working history, which may
not match what is on main / what reviewers approved. Continue anyway? (yes/no)
```

- Proceed **only** on explicit user confirmation. On "no", stop.
- If none of the three conditions are true, continue without prompting.

These are also hard stops regardless of confirmation (you cannot release through them):

- The tag already exists locally or remotely: `git tag -l v<version>` AND `git ls-remote --tags origin v<version>` must both be empty.
- The version is already published: `npm view eleventy-plugin-techdoc@<version> version` must return nothing.
- `make ci` must pass (lint + test + build).

### 3. Tag and push

- Create an annotated tag on the current HEAD: `git tag -a v<version> -m "eleventy-plugin-techdoc v<version>"`.
- Push ONLY the tag (this triggers `release.yml`): `git push origin v<version>`.
- Do NOT bump the version in `package.json`/`shipwright.json` and do NOT commit a version change — the workflow stamps it ephemerally. Source stays `0.0.0-dev`.

### 4. Monitor the release workflow (mandatory — do not stop until it concludes)

- Find the run: `gh run list --workflow=release.yml --limit 5 --json databaseId,headBranch,event,status,conclusion,displayTitle` and pick the run for this tag.
- Watch to completion: `gh run watch <run-id> --exit-status`. A single green snapshot is not enough — wait for the run to conclude.

### 5. On failure — fix it (NO AI co-author, ever)

- Pull the failing logs: `gh run view <run-id> --log-failed`. Diagnose the ACTUAL cause; do not guess.
- Reproduce locally where possible (`make ci`, `node bin/init.js --version`).
- Fix the source, commit with a plain message (NO co-author trailer), and land it on `main` via a PR (branch protection forbids direct pushes); get that PR green and merged.
- Re-tagging rule — npm publishes are **immutable**:
  - If the workflow failed **before** `npm publish` ran (e.g. the CLI version gate), delete the tag and re-tag the same version once the fix is on `main`: `git push origin :v<version>` then `git tag -d v<version>`, then repeat from Step 2.
  - If `npm publish` already **succeeded** (a later step failed), that version is burned — you cannot republish it. Cut the next patch version instead.
- Re-monitor (Step 4) after every push. Loop fix → re-tag/re-run → watch until the run is fully green.

### 6. Confirm success

- The release run concluded `success`.
- `npm view eleventy-plugin-techdoc@<version> version` returns `<version>`.
- A GitHub Release exists: `gh release view v<version>`.
- Report the version, the npm dist-tag (`latest` for stable, `beta` for prereleases), the release run URL, and the GitHub Release URL.

## Rules

- **🔴 NEVER stamp a commit with an AI co-author.** No `Co-Authored-By: Claude …` (or any AI/agent) trailer; author/committer stays the repo's configured git user. Absolute — overrides any default.
- **Never add `NPM_TOKEN` or any token-based publish secret.** Publishing is npm Trusted Publisher OIDC only (`id-token: write`, `--provenance`).
- **Never commit a stamped version into source.** `package.json`/`shipwright.json` stay at `0.0.0-dev` in git; the workflow stamps from the tag in the runner only.
- **Tags only.** This skill may create/push/delete release tags. Branch history rewrites, force-pushes, and `rebase` stay prohibited.
- Release only when `make ci` is green; warn-and-confirm (Step 2) before releasing from a non-`main`, dirty, or unpushed state.

## Success criteria

- `v<version>` tagged and pushed (after a clean pre-flight, or explicit confirmation through the warning).
- The release workflow was watched to completion and is `success`.
- `eleventy-plugin-techdoc@<version>` is live on npm and a GitHub Release exists.
- Any failure was fixed and re-driven to green, with NO AI co-author on any commit.
