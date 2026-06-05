# agent-pmo:74cf183
# =============================================================================
# Standard Makefile — eleventy-plugin-techdoc
# Cross-platform: Linux, macOS, Windows (via GNU Make).
# Plain-JS (ESM) Eleventy plugin/theme + scaffolder CLI. No compile step.
# See REPO-STANDARDS-SPEC [MAKE-TARGETS].
# =============================================================================

.PHONY: build test lint fmt clean ci setup help

# ---------------------------------------------------------------------------
# OS Detection
# ---------------------------------------------------------------------------
ifeq ($(OS),Windows_NT)
  SHELL := powershell.exe
  .SHELLFLAGS := -NoProfile -Command
  RM = Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
  MKDIR = New-Item -ItemType Directory -Force
  HOME ?= $(USERPROFILE)
else
  RM = rm -rf
  MKDIR = mkdir -p
endif

# Coverage — single source of truth is coverage-thresholds.json
# ([COVERAGE-THRESHOLDS-JSON]).
COVERAGE_THRESHOLDS_FILE := coverage-thresholds.json

# =============================================================================
# Standard Targets (the 7 portfolio-wide targets — names never change)
# =============================================================================

## build: Validate the publishable npm package (dry-run pack).
build:
	npm pack --dry-run

## test: Fail-fast tests + coverage threshold + Shipwright CLI version contract.
##       See [TEST-RULES], [COVERAGE-THRESHOLDS-JSON].
test:
	$(MAKE) _cli_contract
	@if [ -d tests ] && [ -d sample_website ]; then \
	  npx playwright install chromium && npx playwright test; \
	else \
	  echo "No committed tests/ + sample_website/ fixtures yet — skipping Playwright e2e."; \
	fi
	$(MAKE) _coverage_check

## lint: ESLint + Prettier check + Shipwright manifest validation (read-only).
lint:
	npm run lint
	npm run fmt:check
	npx --yes @nimblesite/shipwright-validate-manifest shipwright.json

## fmt: Format all code in-place. Pass CHECK=1 for read-only verification (CI).
fmt:
	npm run fmt$(if $(CHECK),:check,)

## clean: Remove coverage and packaging artifacts.
clean:
	$(RM) coverage *.tgz lcov.info coverage-summary.json

## ci: lint + test + build (full CI simulation).
ci: lint test build

## setup: Post-create dev environment setup (devcontainer hook).
setup:
	npm ci
	npx playwright install --with-deps chromium
	@echo "==> Setup complete. Run 'make ci' to validate."

## help: List the standard targets.
help:
	@echo "Standard targets: build test lint fmt clean ci setup"

# =============================================================================
# Private sub-recipes (underscore-prefixed, never public, never in .PHONY)
# =============================================================================

# Shipwright CLI version contract. [SWR-GATE-VERIFY-BINARIES][SWR-VERSION-JSON-OUTPUT]
_cli_contract:
	@expected="eleventy-plugin-techdoc $$(node -p "require('./package.json').version")"; \
	actual="$$(node bin/init.js --version)"; \
	echo "$$actual"; \
	test "$$actual" = "$$expected"
	@node bin/init.js --version --json | node -e 'const o=JSON.parse(require("fs").readFileSync(0,"utf-8"));if(o.manifestVersion!==1||o.name!=="eleventy-plugin-techdoc"||o.kind!=="cli"||!o.version||!o.language){console.error("version --json does not conform");process.exit(1)}'

# Coverage gate. Threshold from coverage-thresholds.json ([COVERAGE-THRESHOLDS-JSON]).
# This theme is exercised by Playwright e2e; per-line instrumentation is not wired yet,
# so the measured floor is 0% and the threshold ratchets UP as unit tests land.
_coverage_check:
	@if [ ! -f "$(COVERAGE_THRESHOLDS_FILE)" ]; then echo "FAIL: $(COVERAGE_THRESHOLDS_FILE) not found"; exit 1; fi; \
	THRESHOLD=$$(jq -r '.default_threshold' "$(COVERAGE_THRESHOLDS_FILE)"); \
	if [ -f coverage/coverage-summary.json ]; then \
	  PCT=$$(jq -r '.total.lines.pct' coverage/coverage-summary.json); \
	else \
	  PCT=0; echo "No coverage/coverage-summary.json — measured line coverage treated as 0%."; \
	fi; \
	PCT_INT=$$(awk "BEGIN{printf \"%d\", $$PCT}"); \
	echo "Line coverage: $${PCT}% (threshold: $${THRESHOLD}%)"; \
	if [ "$$PCT_INT" -lt "$$THRESHOLD" ]; then echo "FAIL: $${PCT}% < $${THRESHOLD}%"; exit 1; else echo "OK: $${PCT}% >= $${THRESHOLD}%"; fi

# =============================================================================
# Repo-Specific Targets
# (none yet — add repo-only helpers here; never shadow the 7 standard targets)
# =============================================================================
