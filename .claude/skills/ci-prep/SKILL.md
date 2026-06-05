---
name: ci-prep
description: Prepares the current branch for CI by running the exact same steps locally and fixing issues. If CI is already failing, fetches the GH Actions logs first to diagnose. Use before pushing, when CI is red, or when the user says "fix ci".
argument-hint: "[--failing] [optional job name to focus on]"
---

<!-- agent-pmo:74cf183 -->

# CI Prep

Prepare the current state for CI. If CI is already failing, fetch and analyze the logs first.

> **Repo context.** This is `eleventy-plugin-techdoc` — a plain-JavaScript (ES modules, Node >= 18) Eleventy (11ty) plugin/theme published to **npm**, plus a scaffolder CLI (`bin/init.js`, run as `npx eleventy-plugin-techdoc`). Build is a cross-platform **Makefile** with the 7 standard targets: `make build` (`npm pack --dry-run`), `make test` (CLI `--version` contract + Playwright e2e + `coverage-thresholds.json` gate, fail-fast), `make lint` (ESLint + Prettier `--check` + Shipwright manifest validation), `make fmt` (Prettier write; `CHECK=1` for check), `make clean`, `make ci` (lint + test + build), `make setup` (`npm ci` + playwright install). CI (`.github/workflows/ci.yml`) calls `npm ci` then `make lint → make test → make build`. Tests are **Playwright** e2e in `tests/` driving the `sample_website/` fixture. Lint/format are **ESLint** (`eslint .`, via `npm run lint`) and **Prettier** (`npm run fmt` / `fmt:check`).

## Arguments

- `--failing` — Indicates a GitHub Actions run is already failing. When present, you MUST execute **Step 1** before doing anything else.
- Any other argument is treated as a job name to focus on (but all failures are still reported).

If `--failing` is NOT passed, skip directly to **Step 2**.

## Step 1 — Fetch failed CI logs (only when `--failing`)

You MUST do this before any other work.

```bash
BRANCH=$(git branch --show-current)
PR_JSON=$(gh pr list --head "$BRANCH" --state open --json number,title,url --limit 1)
```

If the JSON array is empty, **stop immediately**:

> No open PR found for branch `$BRANCH`. Create a PR first.

Otherwise fetch the logs:

```bash
PR_NUMBER=$(echo "$PR_JSON" | jq -r '.[0].number')
gh pr checks "$PR_NUMBER"
RUN_ID=$(gh run list --branch "$BRANCH" --limit 1 --json databaseId --jq '.[0].databaseId')
gh run view "$RUN_ID"
gh run view "$RUN_ID" --log-failed
```

Read **every line** of `--log-failed` output. For each failure note the exact file, line, and error message. If a job name argument was provided, prioritize that job but still report all failures.

## Step 2 — Analyze the CI workflow

1. Find the CI workflow file. It is `.github/workflows/ci.yml` (job `verify`). Also look for any other workflow triggered on `pull_request` or `push`.
2. Read the workflow file completely. Parse every job and every step.
3. Extract the ordered list of commands the CI actually runs. For this repo `.github/workflows/ci.yml` runs, in order:
   - `npm ci` — frozen install (never bare `npm install`).
   - `make lint` — `npm run lint` (`eslint .`) + `npm run fmt:check` (`prettier --check .`) + `npx --yes @nimblesite/shipwright-validate-manifest shipwright.json`.
   - `make test` — the private `_cli_contract` recipe (`node bin/init.js --version` must print exactly `eleventy-plugin-techdoc <version>`; `node bin/init.js --version --json` must conform to `manifestVersion: 1`, `name`, `kind: "cli"`, `version`, `language`), then Playwright e2e (**only if both `tests/` and `sample_website/` exist**, else skipped with a notice), then the private `_coverage_check` recipe (threshold from `coverage-thresholds.json`).
   - `make build` — `npm pack --dry-run` (validates the publishable package assembles).
4. Note any environment variables, matrix strategies, or conditional steps that affect execution (e.g. the `tests/` + `sample_website/` guard inside `make test`; `CI=true` forces Playwright `forbidOnly`/retries/single worker via `playwright.config.js`).

**Do NOT assume the steps.** Extract what `.github/workflows/ci.yml` _actually does_ and run exactly those commands (today: `npm ci` then `make lint`, `make test`, `make build`). If you find extra targets beyond the 7 standard Makefile targets, flag them in your final report.

### Release workflow blocker scan

`.github/workflows/release.yml` exists (tag-triggered npm publish via Trusted Publisher OIDC). Scan it before broad local CI. These are critical blockers and must be fixed before release work is considered CI-ready:

- Tag-triggered jobs checking out `ref: main` instead of the tagged SHA. (This repo checks out the tagged ref and stamps version in the runner working tree only — `package.json` and `shipwright.json` are stamped from the tag and **never committed**.)
- Any `git commit`, `git push`, branch mutation, or tag mutation during release.
- Version bump commits after the tag already exists.
- Ad hoc `sed` version stamping of structured files instead of stamping via `npm version --no-git-tag-version` / a `node` rewrite of `shipwright.json`.
- A release that publishes without the pre-publish CLI version gate (`node bin/init.js --version` must equal `eleventy-plugin-techdoc <tag-version>`).
- A publish step that uses an `NPM_TOKEN` instead of Trusted Publisher OIDC (`id-token: write`, `--provenance`).

## Step 3 — Run each CI step locally, in order

Work through failures in this priority order:

1. **Formatting** — run Prettier first to clear noise (`make fmt`, i.e. `npm run fmt`)
2. **Lint violations** — fix the code pattern (`eslint .` via `npm run lint`)
3. **Contract/validation failures** — Shipwright manifest validation and the CLI `--version` / `--version --json` contracts must pass (the latter two are the `_cli_contract` recipe inside `make test`)
4. **Runtime / test failures** — fix source code to satisfy the Playwright e2e tests

For each command extracted from the CI workflow:

1. Run the command exactly as CI would run it (adjusting only for local environment differences like not needing `actions/checkout`).
2. If the step fails, **stop and fix the issues** before continuing to the next step.
3. After fixing, re-run the same step to confirm it passes.
4. Move to the next step only after the current one succeeds.

Concretely, run locally, in CI order:

```bash
npm ci          # frozen install (matches CI)
make fmt        # auto-format first to clear noise (npm run fmt)
make lint       # eslint . + prettier --check . + Shipwright manifest validation
make test       # _cli_contract (--version / --version --json) + Playwright e2e + coverage gate
make build      # npm pack --dry-run
# or run all three gates at once:
make ci         # lint + test + build
```

### Hard constraints

- **NEVER modify test files** — fix the source code, not the tests
- **NEVER add suppressions** (`// eslint-disable`, `/* eslint-disable */`)
- **NEVER delete or ignore failing tests**
- **NEVER remove assertions**

If stuck on the same failure after 5 attempts, ask the user for help.

## Step 4 — Report

- List every step that was run and its result (pass/fail/fixed).
- If any step could not be fixed, report what failed and why.
- Confirm whether the branch is ready to push.

## Step 5 — Remote CI follow-up (only when `--failing`)

Once all CI steps pass locally:

1. Report the local fixes and exact commands that now pass.
2. Do not commit or push. The user owns source-control writes.
3. If the user pushes, monitor the new run until completion or failure.
4. Upon failure, go back to Step 1.

## Rules

- **Always read the CI workflow first.** Never assume what commands CI runs.
- Do not commit or push from this skill.
- Fix issues found in each step before moving to the next
- Never skip steps or suppress errors
- If the CI workflow has multiple jobs, run all of them (respecting dependency order)
- Skip steps that are CI-infrastructure-only (checkout, setup-node actions, cache steps, artifact uploads) — focus on the actual `make lint` / `make test` / `make build` commands

## Success criteria

- Every command that CI runs has been executed locally and passed
- All fixes are applied to the working tree
- The CI passes successfully (if you are correcting an existing failure)
