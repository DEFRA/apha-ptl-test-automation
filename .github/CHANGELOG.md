# Changelog: v1 → v2

## v2.10: adopting work that already exists

| Problem | Fix | How it is checked |
|---|---|---|
| A fresh run on a brownfield repository found existing specs and CSV test cases but an empty worklog, and started discovery and case-writing from zero — re-crawling, regenerating cases and risking duplicate `TC` refs | `**Cold start when work already exists**` in `e2e-architect`: one `find` inventory, cheap verification via `bddgen`, `--list` and `trace-check`, one `adopted` line per artefact (fingerprint plus mtime, never `done`), catalogue seeded from legacy CSV rows with their `TC` and ADO ids kept, `unverified` for cases without evidence, then automate only the gap; the writer and `ado-testcase-csv` keep existing refs, add only missing rows, continue numbering and log the set `adopted` | the build report shows `adopted / added / skipped` counts and no regenerated or renumbered legacy case; adopted units cost no crawl and no reread |

## v2.9: crawling a portal, not a site

| Problem | Fix | How it is checked |
|---|---|---|
| One anonymous sweep of a portal missed everything behind sign-in: role-specific pages, row actions, tabs, stepper steps, dialogs and saved views, and 200 case URLs were counted as 200 pages | the crawl section is rewritten for portals: one pass per seeded role with a route×role matrix, organisation/tenant switching, a reachability list (row actions, tabs, steppers, dialogs, pagination and filter links, deep links, error surfaces), route templates so parameterised URLs collapse, SPA rules (network idle, `h1`, redirect chains, scroll cap, `unrendered` instead of a false page), state variants per route, XHR/fetch capture for API evidence, and coverage accounting (discovered / visited / blocked / unrendered / failed) | counts are per route template and per role; a role-blocked route appears in the matrix as a finding, not as a missing page |

## v2.8: a worklog instead of rescanning

| Problem | Fix | How it is checked |
|---|---|---|
| A resumed run rediscovered everything: the crawl launched again against the same site, the source was re-read, and cases were regenerated for features already written, so the second run cost as much as the first | `## Worklog and resume` in `e2e-architect`: append-only `docs/worklog.md`, one line per unit with phase, fingerprint, counts, result and artefact, plus a resume protocol (reuse `done` at the same fingerprint, redo only `partial`/`failed` or the delta, log an absent unit after doing it); the writer skips features the log records as `done`; `api-ui-discovery` reuses `crawl.json` and crawls only new routes when the fingerprint moves | a unit logged `done` at the same fingerprint is reused: no browser launch, no source read, no regenerated cases — the log line is the evidence |
| The log could be written and still be ignored, because the agent kept leaning on the conversation: a new chat re-derived counts, re-read the same files and re-did finished units | the log is declared the memory in both agents: preflight reads `00-status.md` then `worklog.md` and resumes at the last unfinished line, a `running` line with no close is an interrupted unit to close or redo, and the build report checks every logged unit against its artefact | a fresh session resumes from the last unfinished line without opening the source or the crawl again |

## v2.7: the run is bounded by credit

| Problem | Fix | How it is checked |
|---|---|---|
| A long run spent its budget re-reading files, echoing JSON and logs, and re-checking gates that had already passed, so the later features ran out of credit mid-build | `## Token economy` in `e2e-architect` (replacing "Working efficiently") and in `e2e-testcase-writer`: plan before reading, search then open a 40–80 line window, one pass per phase, batched tool calls, never echo file contents, capped command output, scripts over prose, one fact in one place, write state after each phase, stop at done | caps are explicit (discovery index ≤ 40 lines, `00-status.md` ≤ 10, report ≤ 40, one line per catalogue row); a repeated read, echoed file or re-run passing gate breaks the section |

## v2.6: discovery is exhaustive, execution is one pass

| Problem | Fix | How it is checked |
|---|---|---|
| The architect discovered a feature, wrote cases for it and moved on, so routes, controls, validation rules and roles that were never reached in the first pass never became scenarios; nothing measured what had been missed | a `## Discovery contract` section in `e2e-architect` enumerates routes, controls, forms and every validation rule, states, roles, endpoints and data rules, and requires a reconciliation with counts in `00-status.md`; `docs/01-scenario-catalogue.md` plus `docs/scenarios.json` carry one row per behaviour with `file:line` or crawl evidence | `trace-check` reports every catalogue row, test case and scenario that do not match; a shortfall needs a dated reason in the build report |
| Automation was written one feature at a time and each slice was executed before the next, so a twelve-feature run meant twelve partial runs and twelve partial result sets | workflow steps are build-all, then `eslint` + `bddgen` + `--list` per slice, then **one** whole-suite execution at the end; `## Token economy` (then "Working efficiently") and `## Must not` forbid running the suite while building | the build report shows one run of `npx playwright test` with the full pass/fail set per tag |
| The crawl stopped at depth 3 / 50 pages and recorded labels only, so runtime-only behaviour was invisible and the CSV was a sample | `api-ui-discovery` crawls depth 5 / 200 pages until the queue is empty or the cap is hit, records every control with the operation it performs and every field constraint with its error text, and adds scenario candidates and a two-way route reconciliation per feature | discovery output is the catalogue's evidence: a control or rule with no inventory entry has no scenario and fails reconciliation |
| The writer expanded "only scenarios in the approved plan" and asked a question when no requirements existed, which stalled a pack with no approval step | `ado-testcase-csv` expands every row in `docs/scenarios.json` in one pass, and derives criteria from code and crawl with `DERIVED: ... - file:line` when requirements are absent | the CSV set equals the catalogue, and `trace-check` finds no unexpanded row |
| The writer agent still ended with `Stop and wait for TESTCASES APPROVED: <feature>` and expanded only "approved scenarios", so a run halted after the first feature no matter what the architect said | the writer expands every row in `docs/scenarios.json` for every feature in one pass, derives criteria with `DERIVED: ... - file:line` when requirements are absent instead of asking, and its handoff no longer claims approval; the architect states that it must not pause between features, report per feature, or hand back a partial pack | no agent in the pack contains an approval gate, and `grep -rn "APPROVED" v2/github` returns only the "do not wait" instructions |

## v2.5: the crawl walks actions, and every mandatory rule is proven

| Problem | Fix | How it is checked |
|---|---|---|
| The crawl followed URLs only, so a page's CRUD and search were inferred from "it looks like a form" rather than from a control a user can press; a declared operation could point at a link that never loaded, and no gate noticed | every control (`a[href]`, `button`, submit, `role=button`) is recorded with its text, `href`, region and disabled state, classified by **what it does** (create, update, delete, search, read), and its destination is checked against the pages actually reached; each page carries `affordances` (with `blocked` reasons) and `operationsAvailable`; `page-coverage.js` fails when an inventory operation has no affordance and no source citation in `evidence` | fixture: declaring `update` on a page with no edit control fails; the same page passes with the affordance, and passes with `evidence.update` instead |
| Forms recorded field names only, so `required` and format rules were never proven — the suite could claim validation coverage while testing none of it | the crawl records each field's label, type, `required`, `pattern`, `maxlength`, `min`/`max` and a flat `validation` rule list per form; new `validation-coverage.js` (`npm run validations`) fails while a rule has no case; cases claim rules with `validation: [{ page, field, rule }]`; dated waivers live in `docs/validation-waivers.json`; the ADO pipeline runs the gate | fixture: an uncovered `required` fails, an uncovered `pattern:` fails, a covering case passes, an expired waiver fails, a claim against an undeclared rule fails |

Every entry maps to a finding in `../GAP-ANALYSIS.md`. Nothing here is a rename: each item
changes behaviour, and each has a check that can fail.

## v2.4: the whole menu, covered, and one verification pass

| Problem | Fix | How it is checked |
|---|---|---|
| The menu was discovered as prose and covered by two chrome scenarios (logo, footer), so menu destinations with create, search, update or delete were never tested; and the architect verified each feature slice in turn, so a twelve-feature run meant twelve partial runs and twelve partial gate passes | `instructions/navigation-coverage.instructions.md`; `navigation.md` must carry one table per role with the columns `Menu item | Route | Destination h1 | Operations | Source`; `page-coverage.js` (`npm run pages`) parses it and fails on a route the inventory does not know, an operation the inventory does not declare, an operation with no case or waiver, or a missing `read`; the architect builds every feature before verifying, then runs all gates and the whole suite once | fixture: a menu row with an undeclared operation fails, an uncovered operation fails, a missing `navigation.md` fails, a covered menu passes |

## v2.3: roles — the same user under several roles

| Problem | Fix | How it is checked |
|---|---|---|
| A role matrix (one user, applicant and assessor) had no way to be expressed: writing `| role |` in `Examples` produced an outline that ran every row under the first role, because auth state belongs to a Playwright project, and every rendered ADO case came out identical | `roles` on a test case (two or more names, `<role>` used in a step, never mixed with `datasets`); the converter emits one ADO case per role, titled `<title> [<role>]` with the value substituted and `--ids` keys `TC-005` / `TC-005#2`; the automation is one plain scenario per role tagged `@role:<name>`; `trace-check.js` fails on a missing role scenario, a wrong tag or title, a role written as an outline, and a `role` column in `Examples`; `automation-map.js` links each role case to its own work item | converter + trace-check on a fixture: a matching role matrix passes; a missing assessor scenario, an outline-per-role, `roles` + `datasets`, and a `role` Examples column each fail |

## v2.2: `Scenario Outline` only for real datasets

| Problem | Fix | How it is checked |
|---|---|---|
| The test-case JSON could not express a behaviour proved over several values, so the writer either duplicated cases or wrote placeholders a tester could not run; and nothing stopped an outline being added with no matching data, or with one row | `datasets` on a test case (two or more entries, identical columns, every column used as `<column>`); the converter emits one ADO case per dataset, titled `<title> [<name>]` with the values substituted and `--ids` keys `TC-004` / `TC-004#2`; `trace-check.js` parses the `Examples` table and fails on a title, count, column or value mismatch, on an outline whose case declares no datasets, and on a dataset case written as a plain scenario; `automation-map.js` links each dataset case to its own work item | converter and trace-check run on a fixture: a matching outline passes; one stale value, one missing row, an outline without datasets, and a single-dataset case each fail |
| `ado-ids.json` in `docs/test-cases/` — the path the skill tells you to use — was parsed as a test-case file and failed the gate | `trace-check.js` and `page-coverage.js` skip `ado-ids.json` and `automation-map.json` | trace-check run with the id map present |

## v2.1: autonomy, tool access and per-page operations

| Problem | Fix | How it is checked |
|---|---|---|
| The agents stopped for approval on nearly every action, and the README told users to keep terminal auto-approval off | `instructions/autonomy.instructions.md` (standing permissions, four stop conditions, one report), a `## Autonomy` section in all three agents, and a shipped `vscode/settings.json` with `chat.permissions.default: autoApprove` plus allow/deny terminal rules; both installers copy it | the settings file parses; an agent completes a phase without a question |
| Tool lists carried retired names (`findTestFiles`, `usages`, `changes`, `todos`, `thinking`), so the agent was missing tools its prose told it to use | Only documented aliases: architect `['*']` (it must reach browser/MCP tools too), writer `[edit, execute, read, search, web, todo]`, reviewer `[execute, read, search, web, todo]` | frontmatter diff against the Copilot alias list |
| Discovery recorded pages but not what they do, so the generated suite had no CRUD or search coverage | `operations` per page (`read`, `search`, `create`, `update`, `delete`) with evidence; the cursor now records forms, search inputs and destructive controls; the plan writes `docs/page-operations.json`; the writer fills `tc`; `scripts/page-coverage.js` (`npm run pages`) and the pipeline gate fail on a gap | the gate fails on a declared operation with no case and passes once one is mapped |

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
| **M4** | Template dedupe could hide real violations with no guardrail | Documented, `A11Y_DEDUPE_BY_TEMPLATE=false` audit mode, the count is always reported, and the ADO summary states it |
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
