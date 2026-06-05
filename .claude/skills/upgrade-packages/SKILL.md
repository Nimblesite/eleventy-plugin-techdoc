---
name: upgrade-packages
description: Upgrade all dependencies/packages to their latest versions for the detected language(s). Use when the user says "upgrade packages", "update dependencies", "bump versions", "update packages", or "upgrade deps".
argument-hint: "[--check-only] [--major] [package-name]"
---
<!-- agent-pmo:74cf183 -->

# Upgrade Packages

Upgrade all project dependencies to their latest compatible (or latest major, if `--major`) versions.

> **Repo context.** `eleventy-plugin-techdoc` is a plain-JavaScript (ES modules, Node >= 18) **npm** package. The manifest is `package.json` with the lockfile `package-lock.json`. Dependencies are runtime libs (`@11ty/eleventy-*`, `markdown-it*`, `@inquirer/prompts`), a peer dependency (`@11ty/eleventy ^3.1.2`), and a dev dependency (`@playwright/test`). This repo is JavaScript end to end, so this skill operates on **npm only**.

## Arguments

- `--check-only` — List outdated packages without upgrading. Stop after Step 2.
- `--major` — Include major version bumps (breaking changes). Without this flag, stay within semver-compatible ranges.
- Any other argument is treated as a specific package name to upgrade (instead of all packages).

## Step 1 — Confirm the package manager

The manifest is `package.json` at the repo root and the lockfile is `package-lock.json`, so the package manager is **npm**. (If a `yarn.lock` or `pnpm-lock.yaml` ever appears, switch to that tool — but today it is npm.)

## Step 2 — List outdated packages

Run this BEFORE upgrading anything. Show the user what will change.

```bash
npm outdated
```

**Read the docs:** https://docs.npmjs.com/cli/v10/commands/npm-update

If `--check-only` was passed, **stop here** and report the outdated list.

## Step 3 — Read the official upgrade docs

**Before running any upgrade command, you MUST fetch and read the official npm documentation** (https://docs.npmjs.com/cli/v10/commands/npm-update) with WebFetch. This ensures you use the correct flags and understand the behavior. Do not guess at flags or options from memory.

## Step 4 — Upgrade packages

Run the upgrade. If a specific package name was given as an argument, upgrade only that package.

```bash
npm update                                  # semver-compatible (within package.json ranges)
# --major flag:
npx npm-check-updates -u && npm install     # bump package.json to latest majors
```

Notes specific to this repo:

- `@11ty/eleventy` is a **peer dependency** (`^3.1.2`), not a regular dependency. Do not move it into `dependencies`; bump the peer range deliberately and only when intentionally targeting a new Eleventy major. A peer bump is a contract change for consumers — flag it explicitly.
- `@playwright/test` is the only `devDependency`. After upgrading it, you may need `npx playwright install` to fetch matching browsers before the e2e suite will run.
- If a specific package name was given, prefer `npm install <pkg>@latest` (or `npx npm-check-updates -u <pkg>`) for that single package.

## Step 5 — Verify the upgrade

Run the project's full gate via the Makefile (this is exactly what CI runs — `npm ci` then `make lint → make test → make build`):

```bash
npm ci          # frozen install against the updated lockfile
make ci         # make lint + make test + make build
```

`make lint` runs ESLint + Prettier `--check` + Shipwright manifest validation; `make test` runs the CLI `--version` contract + Playwright e2e (when `tests/` + `sample_website/` exist) + the `coverage-thresholds.json` gate; `make build` runs `npm pack --dry-run`.

If tests fail:

1. Read the failure output carefully.
2. Check the changelog / migration guide for the upgraded packages (fetch the release notes URL if available) — Eleventy 3.x and `markdown-it` majors are the most likely sources of breakage here.
3. Fix breaking changes in the code (`lib/`, `bin/init.js`, `templates/`, `assets/`).
4. Re-run tests.
5. If stuck after 3 attempts on the same failure, report it to the user with the error details and the package that caused it.

## Step 6 — Report

Provide a summary:

- Packages upgraded (old version -> new version)
- Packages skipped (and why, e.g., major version bump without `--major` flag, or a deliberate hold on the `@11ty/eleventy` peer range)
- Build/test result after upgrade
- Any breaking changes that were fixed
- Any packages that could not be upgraded (with error details)

## Rules

- **Always list outdated packages first** with `npm outdated` before upgrading anything
- **Always read the official npm docs** before running upgrade commands
- **Always run tests after upgrading** to catch breakage immediately
- **Never remove packages** unless they were explicitly deprecated and replaced
- **Never downgrade packages** unless rolling back a broken upgrade
- **Never modify the lockfile manually** (`package-lock.json`) — let npm regenerate it
- **Treat the `@11ty/eleventy` peer-dependency range as a public contract** — bump it deliberately, never as a side effect
- **Commit nothing** — leave changes in the working tree for the user to review

## Success criteria

- All outdated packages upgraded to latest compatible (or latest major if `--major`)
- `npm ci` succeeds against the regenerated lockfile
- `make ci` passes (lint incl. Shipwright manifest validation, the CLI `--version` contracts, Playwright e2e, and `npm pack --dry-run`)
- User has a clear summary of what changed
