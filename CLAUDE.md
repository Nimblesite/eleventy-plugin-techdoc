<!-- agent-pmo:74cf183 -->

# eleventy-plugin-techdoc — Agent Instructions

> ⚠️ **TOKEN DISCIPLINE.** Check file size first. `Grep` over `Read`. Smallest diff that
> solves the problem. Delete dead code, unused imports, stale comments. ⚠️

> Read this file in full. Rules below are NON-NEGOTIABLE — violations are rejected in review.

## Project Overview

`eleventy-plugin-techdoc` is a **minimal, structural** Eleventy (11ty) theme/plugin for
technical documentation and blogs, published to **npm**. It ships Nunjucks layouts,
collections, filters, shortcodes, SEO/feed/sitemap/llms.txt generation, and a small amount
of **structural-only** CSS. A bundled CLI (`bin/init.js`, run as `npx eleventy-plugin-techdoc`)
scaffolds a working site.

**Defining contract: the theme provides STRUCTURE ONLY — no colors, no typography, no
decorative styling. The consuming site owns ALL visual styling.** See invariants below.

**Primary language:** JavaScript (ES modules, Node ≥ 18). No TypeScript, no transpile step.
**Build command:** `make ci` · **Test command:** `make test` · **Lint command:** `make lint`

## Architecture & Critical Invariants

- **Plugin entry:** `lib/index.js` — `techdocPlugin(eleventyConfig, options)` registers filters,
  collections, shortcodes, virtual templates, markdown config, and bundled 11ty plugins, and
  copies `assets/` to the consuming site's output under `/techdoc/`.
- **CLI scaffolder:** `bin/init.js` — interactive; supports `--version` and `--version --json`
  (Shipwright version contract). It MUST skip files that already exist — never overwrite a
  user's files.
- **NEVER CLOBBER THE HOST SITE'S CSS.** `assets/css/reset.css` stays free of global content
  overrides (no `* { margin:0 }`, no `ul,ol { list-style:none }`, no global typography / img /
  table / form resets). Resets are scoped to theme-owned elements only (`.nav-links`,
  `.sidebar ul`, `.footer-section ul`, theme buttons) and live in `layout.css`. The theme's CSS
  loads BEFORE the site's stylesheet so the site always wins the cascade. Structural CSS carries
  NO colors and NO typography.
- **Templates** in `templates/` are Nunjucks (`.njk`) layouts/pages shipped to consumers.
  `assets/js/` are browser scripts (theme toggle, mobile menu, language switcher) shipped to
  the consuming site.

## Shipwright Deployment Contract

This repo follows the Shipwright deployment contract (`[SWR-*]` IDs in CI/release/manifest
comments). Preserve it.

- `shipwright.json` is the release manifest. Source carries version `0.0.0-dev`; the
  tag-triggered `release.yml` stamps the real version into `package.json` + `shipwright.json`
  in the runner working tree only — never committed.
- Publishing uses **npm Trusted Publisher OIDC** (provenance, no `NPM_TOKEN`) via the
  `NPM Deployment` environment. Do NOT add token-based publish secrets.
- The CLI `--version` string contract (`eleventy-plugin-techdoc <version>`) and the
  `--version --json` schema are gated inside `make test`. Keep them green.

## Hard Rules — Universal

- **NO git commands.** No add/commit/push/checkout/merge/rebase. CI handles git.
- **ZERO DUPLICATION.** Search before writing. Move code, don't copy it.
- **NO PLACEHOLDERS / silent no-ops.** Implement it or fail loudly.
- **Functions < 20 lines. Files < 500 lines.** Refactor when over.
- **Never delete or skip tests. Never remove assertions.**
- **`make test` is FAIL-FAST + coverage.** Stops at first failing test; computes coverage and
  enforces the threshold from `coverage-thresholds.json` — NOT env vars, NOT gh variables, NOT
  CI YAML. Ratchet only (never lower). See REPO-STANDARDS-SPEC [TEST-RULES],
  [COVERAGE-THRESHOLDS-JSON].
- **Prefer E2E/integration tests** (Playwright against a rendered sample site). Unit tests only
  to isolate problems.
- **No linter suppressions.** Fix the code.
- **Spec IDs are hierarchical, non-numeric** `[GROUP-TOPIC]` (e.g. `[CI-RELEASE]`). Code/tests/
  docs implementing a spec section reference its ID in a comment so `grep` finds spec → code.

## Hard Rules — JavaScript (ESM)

- ES modules only (`import`/`export`, `"type": "module"`). Node ≥ 18.
- `const`/`let`, never `var`. `===`/`!==`, never `==`. Always brace blocks.
- No unused vars (prefix an intentionally-unused arg with `_`).
- Prefer pure functions; avoid hidden mutable module state.
- No new runtime dependencies without need — this is a library with a peer dep on
  `@11ty/eleventy`.

## Console / Logging

This is a **build-time Eleventy plugin and an interactive CLI**, not a long-running service.
`console.*` is the legitimate user-facing I/O channel for CLI prompts and Eleventy build output
— intentional and allowed (ESLint `no-console` is off here). The portfolio structured-logging
rule (pino, async DB sinks) targets runtime services and does not apply here. Still: **NEVER log
secrets or PII.**

## Testing Rules

- Tests are **black-box Playwright e2e** against a rendered sample site (`playwright.config.js`
  builds `sample_website/` via Eleventy and serves it). Interact only through rendered output —
  never reach into plugin internals.
- Never delete a failing test; fix the code or the expectation. No swallowing exceptions and
  asserting success. Specific assertions only. Deterministic — no `sleep()`/timing/random state.
- Coverage: this theme is exercised end-to-end; per-line unit-coverage instrumentation is not
  wired yet, so `coverage-thresholds.json` starts at `0` and ratchets UP as unit tests are added.

## Website / Output SEO

The theme emits canonical URLs, Open Graph / Twitter meta, JSON-LD, hreflang, `feed.xml`,
`sitemap.xml`, `robots.txt`, and `llms.txt`. When changing generated metadata, follow Google's
[Succeeding in AI search](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search)
and [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

## Build Commands

Cross-platform GNU Make. Exactly 7 targets — no others:

```bash
make build   # validate the publishable npm package (npm pack --dry-run)
make test    # FAIL-FAST Playwright e2e + CLI version contract + coverage threshold (ONLY test entry)
make lint    # eslint + prettier --check + shipwright manifest validation (read-only)
make fmt     # prettier --write (CHECK=1 for read-only check)
make clean   # remove coverage / pack artifacts
make ci      # lint + test + build (full CI simulation)
make setup   # npm ci + install the Playwright browser
```

`make fmt` formats in-place; `make lint` is read-only; `make test` runs tests + coverage. No
overlap. To debug one test, call `npx playwright test <file>` directly — that is not a Make target.

## Repo Structure

```
lib/                plugin source (index.js entry; filters/, plugins/, shortcodes/, virtual-templates.js)
bin/init.js         scaffolder CLI (npx eleventy-plugin-techdoc)
templates/          Nunjucks layouts + pages shipped to consumers
assets/css/         structural CSS (reset, layout, utilities) — NO colors / NO typography
assets/js/          browser scripts (theme toggle, mobile menu, language switcher)
docs/specs/         behavior specs (SPEC.md)
docs/plans/         plan docs (each ends with a TODO checklist)
.github/workflows/  ci.yml (lint→test→build), release.yml (tag → OIDC npm publish)
shipwright.json     release manifest
coverage-thresholds.json   coverage source of truth
```

## Too Many Cooks (Multi-Agent Coordination)

If the TMC server is available: register on start (name, intent, files), lock files before
editing, broadcast your plan, check messages periodically, release locks when done. Never edit a
locked file — wait or take another approach.

## Branch & PR

Default branch `main`. All changes via PR; squash-merge; CI must pass before merge. Branch
naming: `feature/<slug>`, `fix/<slug>`, `chore/<slug>`. PRs use
`.github/pull_request_template.md`.
