# Changelog: v1 → v2

Every entry maps to a finding in `../GAP-ANALYSIS.md`. Nothing here is a rename: each item
changes behaviour, and each has a check that can fail.

## Conformance with Defra's Copilot guidance

Re-checked against <https://defra.github.io/defra-ai-config-examples/> after the rebuild. These
changes align the pack with the published guidance; the README section "How it follows Defra's
Copilot guidance" holds the full map and the deliberate deviations.

| Area | Was | Now |
|---|---|---|
| Agent format | Free-form headings, `## Must not`, descriptions of 300+ characters | `## Role`, `## Workflow`, `## Rules`, `## References`; descriptions under 100 characters; rules start with "Never" so they read as imperatives |
| Agent tools | Documented-alias-only list | Tool sets in Defra's order, including `todos` and `thinking` beside `todo` |
| Agent invocation | `user-invocable: false` on both worker agents, which also killed the handoff fallback the README promised | Both are invocable; subagents and handoffs now both work |
| Testing instructions | Repo-specific rules, `applyTo: "**/*.{test,spec}.{js,mjs},test/**"` | Defra's testing instructions, adapted: framework table, `test/journey/`, BDD naming with counter-examples, Arrange-Act-Assert, 90/95/100 coverage, SonarWay gate, `createServer()` route testing, mocking discipline, "what to avoid". `applyTo` uses Defra's comma-separated globs |
| Agent Skills setting | README said no such setting exists | README documents `"chat.agent.skills": true` as a per-developer step, as Defra's guidance requires |
| `.copilotignore` contents | Hand-written subset | Defra's full recommended list (keys, certificates, PII fixture paths, OFFICIAL-SENSITIVE, cloud credentials, generated secrets) plus the pack's run artefacts |
| Accessibility default | Legacy reported violations and passed | Both profiles fail on any violation not in the committed baseline (`A11Y_FAIL_ON_NEW` defaults to true), which is Defra's zero-violations standard; a backlog is recorded once, deliberately |
| GDS components | No Details, Table or Tag wrapper | `components/details.js`, `table.js`, `tag.js` — the three Defra's tester example names besides forms, with rows found by first cell and columns by header text. Exercised in Chromium against GOV.UK markup: 17/17 checks, which caught an async bug in `cellText` before it shipped |
| Journey-test folder | Open question (`test/journey/` vs `/tests`) | Closed: Defra's testing instructions say `test/journey/`, which is what the pack uses; the Tester example's `/tests` is noted in the README |

## Blockers

| ID | Finding in v1 | Fix in v2 |
|---|---|---|
| **B1** | Handoffs and `agents:` are rejected by the Copilot harness; the pack never said which harness it targets | `target: vscode` on all three agents; README "Read this first: which harness" states the supported target and what breaks on the cloud agent |
| **B2** | `.copilotignore` does nothing in Copilot; the installers never wrote `.gitignore`, so `.auth/` session cookies could be committed | `copilotignore.txt` replaced by `ignore.txt`; installers merge it into **`.gitignore`** and `.copilotignore`, back up conflicts, drop `.DS_Store`; README explains what actually excludes content and what does not |
| **B3** | Requirements optional, `acs` mandatory, `clarification_needed` killed the converter: the no-requirements path deadlocked | `DERIVED: <behaviour> - <file:line>` acceptance criteria, validated for evidence and paired with `open_questions`; converter exits **3** ("ask the user") distinct from 1 ("validation problems"); writer returns questions instead of writing a clarification file |
| **B4** | `trace-check.js` passed a CSV whose step text no longer matched the JSON (reproduced: 0 problems, exit 0) | `trace-check.js` now calls the converter's `--check`, which re-renders and compares byte for byte; title match is exact after whitespace normalisation; Python missing is itself a problem, not a silent skip |

## Majors

| ID | Finding in v1 | Fix in v2 |
|---|---|---|
| **M1** | No scaffold; the only config sample lacked `defineBddConfig`, so it would have found zero tests | `playwright-bdd-pack/templates/scaffold/` — 28 files: working config (BDD `steps` wired, role projects, `grepInvert`, dotenv), `fixtures.js`, `env.js`, `auth.setup.js`, `BasePage`, content maps, seeded builders, API client, `eslint.config.js` with the no-sleep/no-only rules, `.env.example`, `.gitignore`, docs seeds, folder guidance and a runnable `@wip` example. Scaffolding now happens **before** discovery (step 2), because the crawl needs Playwright installed |
| **M2** | Requirement 3 was a helper, not scripts: `@a11y` tag unused, legacy never failed, a never-visited page only appeared in a JSON list | `scripts/a11y-coverage.js` gate (scanned, templated or waived, with stale/expired waiver checks); `A11Y_FAIL_ON_NEW` + `docs/a11y-baseline.json` so a PR cannot add a legacy violation; `@a11y` removed from the vocabulary and the reason documented |
| **M3** | Template-deduped routes were counted as covered and omitted from "not scanned" (reproduced) | Report and summary separate three buckets: analysed, covered by template, not visited; the HTML says outright that axe did not run on the middle one |
| **M4** | Template dedupe could hide real violations with no guardrail | Documented, `A11Y_DEDUPE_BY_TEMPLATE=false` audit mode, the count is always reported, and the CI summary states it |
| **M5** | ADO test cases and automated results never met in Test Plans, so requirement suites showed no automation coverage | `scripts/automation-map.js` builds `automation-map.json` from refs, scenarios and JUnit, and `--push` sets `AutomationStatus`/`AutomatedTestName`/`Storage`/`Type`; `ado-ids.json` makes re-imports update instead of duplicate (`--ids`) |
| **M6** | Pipeline could not prove the migration: one hard-coded profile, and the skill forbade a second job | Matrix over `profiles` with `fail-fast: false`, default `[legacy]` and `[legacy, gds]` during migration; `suite` parameter for `@smoke`/`@regression`; eligibility rules rewritten |
| **M7** | `byProfile` fell back to `common`, and an unknown profile produced `undefined` locators (reproduced) | `PROFILE` validated at import (throws on `GDS`, `typo`); `byProfile` requires the active profile's key and throws with the keys it was given; `common` removed; content maps duplicate values across profiles on purpose |
| **M8** | `findTestFiles`, `usages`, `changes`, `todos`, `thinking` are not Copilot tool aliases; prose pointed at tools that did not exist | Tool sets only, in Defra's order: architect `[agent, edit, execute, read, search, web, todo, todos, thinking]`, writer `[edit, execute, read, search, todo, todos]`, reviewer `[execute, read, search, web, todo, todos]`. `findTestFiles`, `usages` and `changes` are gone; `todo` and `todos` are both listed because VS Code documents the first and Defra's guidance uses the second, and unknown names are ignored |
| **M9** | GDS runtime behaviour unhandled: visually hidden `Error:`, cookie banner, skip link, back link, component shapes | `support/text.js` (`textPattern`/`namePattern`/`visibleText`); 15 component files including cookie banner, skip link, error summary, date input, details, table and tag; Rule 9 "first-visit chrome"; assertions use patterns, never bare strings |
| **M10** | Inventory was not profile-aware, so every page reported as unscanned after cutover (reproduced) | `page-inventory.json` entries carry `profile`; discovery owns the file and states the rule; report and coverage filter to the active profile |

## Minors

| ID | Fix in v2 |
|---|---|
| m1 | `v1/` holds the previous pack; `v2/` is this one; README and this file state the baseline (reviewed v4) and the version skew in the original repo |
| m2 | README documents `chat.agent.skills: true` as a **user-level** setup step, which is what Defra's guidance requires; v1 presented it as a workspace switch the pack could ship |
| m3 | README explains model pinning honestly (picker, or `model:` with an ID from completions) instead of a field the pack never used |
| m4 | `copilot-instructions.md` and `testing.instructions.md` now ship, so the "single source of truth" resolves |
| m5 | SonarCloud removed from the journey-test DoD, because journey tests do not move application coverage; Defra's 90/95/100 coverage targets and the SonarWay gate now live in `testing.instructions.md` where they apply, and the reviewer records the gate only if the repository uses SonarCloud |
| m6 | `docs/approvals.json` replaces prose parsing; `trace-check` enforces `approvedAt` and per-feature `testcases.<f>`; `00-status.md` keeps its 15-line shape and says where approvals live |
| m7 | Crawl is part of discovery, uses the shipped `crawl.mjs`, and `crawl.json` is consumed to build the inventory; reconcile source routes against crawled pages |
| m8 | The scan key includes `role`, `expectPageLoaded` forwards it, and the docs explain that a role-specific page is a second scan |
| m9 | Step 1 of a test case is a precondition satisfied by the role project; the writer, the reference prompt and the skill all say so, and credentials are banned from steps |
| m10 | `--ids` passthrough so a re-import updates work items; `ado-ids.json` documented as the map to keep |
| m11 | Exact title match after whitespace normalisation instead of `startsWith` |
| m12 | `scripts/check-grounding.js` enforces `// source:` on every endpoint, page locator and content entry; `grounding-allow.json` for genuine exceptions |
| m13 | Discovery alone writes `page-inventory.json`; the architect validates it |
| m14 | Installers back up overwritten files and never copy `.DS_Store` |

## New files, for the record

```
github/instructions/copilot-instructions.md
github/instructions/testing.instructions.md
github/skills/api-ui-discovery/templates/crawl.mjs
github/skills/ado-testcase-csv/scripts/automation-map.js
github/skills/a11y-page-scan/templates/scripts/{a11y-coverage,a11y-baseline}.js
github/skills/gds-migration-resilience/templates/support/text.js
github/skills/gds-migration-resilience/templates/scripts/migration-readiness.js
github/skills/gds-migration-resilience/templates/components/*.js        (12 files)
github/skills/playwright-bdd-pack/templates/scripts/check-grounding.js
github/skills/playwright-bdd-pack/templates/scaffold/**                 (28 files)
ignore.txt
```

## Additions found during verification

Running the scaffold end to end (npm install, `bddgen`, ESLint, a real browser against a
local site) exposed four things that a paper review would have missed, all fixed:

- `playwright-bdd` 9 requires `test` to be extended from its own export, and the fixtures file
  must be listed in the BDD `steps` option. Both are now wired, and the reason is commented in
  the config.
- `dotenv` was missing, so `.env` was never read; the config now loads it.
- ESLint needed browser globals and `no-empty-pattern` off for Playwright fixture signatures.
- The scaffold's own example content and generic `BasePage` tripped the grounding and readiness
  gates on a fresh install. Examples now carry `// source: CHANGE-ME` markers, `BasePage` is in
  `grounding-allow.json`, and pack-owned component markers are reported separately from project
  ones. A fresh scaffold passes every gate except accessibility coverage, which correctly fails
  until discovery writes an inventory.

## Deliberately not changed

- `test/journey/` as the folder, `playwright-bdd` as the runner, one job per profile rather than
  one job overall. All three are recorded as decisions in README "Open points", because they are
  yours to make, not the pack's.
- The honesty rules ("report `NOT VERIFIED`", "never claim a pass without a run", "do not weaken
  an assertion"). They were the best part of v1.
