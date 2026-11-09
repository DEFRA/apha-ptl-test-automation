# Copilot E2E Agent Pack v2

Playwright + JavaScript, Gherkin BDD, Page Object Model, GOV.UK-migration-ready locators, ADO
test-case CSV with a machine-checked approval ledger, gated axe-core accessibility scans, and a
GitHub Actions workflow that proves both UI profiles.

This is the rebuilt pack. `../v1/` is the previous version, untouched. `../GAP-ANALYSIS.md`
is the gap analysis that drove every change; `CHANGELOG.md` maps each finding to its fix.

---

## Read this first: which harness

The pack uses **custom agents, handoffs, subagents, instructions and skills** in VS Code.

| Harness | Works? | Why |
|---|---|---|
| VS Code, Copilot agent mode (Local harness) | **Yes** — this is the supported target | handoffs, `agents:` subagents, `@role:` projects, local network access to the test environment |
| Copilot cloud coding agent | **No** | it does not accept `handoffs` or `agents:`, and it cannot reach an internal Defra test environment |
| Copilot CLI / other IDEs | Untested | instructions and skills load, handoffs do not |

All three agent files carry `target: vscode`, so the editor validates them against the schema
they were written for. If your Defra rollout is on the cloud coding agent, the orchestration has
to be rewritten around the native task tool first — say so and it can be done, but it is not a
config change.

## What is in the box

```
github/agents/             e2e-architect (lead), e2e-testcase-writer, e2e-reviewer
github/instructions/       copilot-instructions.md, testing.instructions.md,
                           journey-tests.instructions.md
github/skills/
  api-ui-discovery/        source + read-only crawl, profile-tagged page inventory
  ado-testcase-csv/        JSON → CSV converter, trace-check, automation map
  playwright-bdd-pack/     standards + a runnable scaffold
  gds-migration-resilience/ validated profiles, GDS text helpers, 14 component wrappers
  a11y-page-scan/          deduplicated scans, coverage gate, legacy baseline, report
  gha-pipeline/            GitHub Actions workflow + run summary
install.sh / install.ps1   copy into .github/, back up conflicts, write .gitignore
ignore.txt                 the one ignore list, merged into .gitignore and .copilotignore
```

## How it follows Defra's Copilot guidance

Checked line by line against <https://defra.github.io/defra-ai-config-examples/> (agents, instructions,
skills, `.copilotignore`, testing instructions, tester agent).

| Defra guidance | Where this pack does it |
|---|---|
| Agents in `.github/agents/*.agent.md`, one-line `description` under 100 characters | all three agents; the long explanation lives in `## Role` |
| Agent sections: Role, Workflow, Rules, References | all three, plus the extra sections this workflow needs (Prerequisites, Pipeline, Verification) |
| Prefer tool sets (`edit`, `execute`, `read`, `search`, `web`, `agent`); add `todos` for multi-step agents | architect `[agent, edit, execute, read, search, web, todo, todos, thinking]`, writer `[edit, execute, read, search, todo, todos]`, reviewer `[execute, read, search, web, todo, todos]` |
| Omit `edit` and `execute` for a read-only reviewer | reviewer has no `edit` (see deviations) |
| Instructions: one file per concern, imperative, one example and one counter-example per rule, under 200 lines, `applyTo` globs | `copilot-instructions.md` (repository), `testing.instructions.md` (Defra's file, adapted), `journey-tests.instructions.md` (journey detail) — all well under the limit |
| Skills: `.github/skills/{name}/SKILL.md`, `name` matching the folder, description with activation keywords, `metadata`, `compatibility`, under 500 lines | seven skills; frontmatter matches the format, the largest is under 200 lines |
| Skills are off until each developer sets `chat.agent.skills` | documented as a required local step in "Set up the workspace" |
| `.copilotignore` for context exclusion, plus the caveat that it does not stop Git tracking | `ignore.txt` carries Defra's full recommended list and is merged into **both** `.gitignore` and `.copilotignore` |
| Testing instructions: Jest, Supertest via `createServer()`, Playwright E2E, BDD naming, Arrange-Act-Assert, 90/95/100 coverage, SonarWay gate, mocking discipline, no `.skip`/`.only`/sleeps | `testing.instructions.md` |
| Journey tests in `test/journey/`, axe-core with zero violations, GDS components (forms, details, tables, tags) | scaffold location, `A11Y_FAIL_ON_NEW` on by default, `details`/`table`/`tag` wrappers |
| No real personal data; synthetic values (`Jane Smith`, `test@example.com`, `AB12 3CD`) | builders, instructions and the writer agent's rules |

### Deliberate deviations

- **The reviewer keeps `execute`.** Defra suggests omitting it from read-only agents, but this
  reviewer's entire value is running the gates (`trace-check`, `grounding`, `readiness`, `eslint`,
  `a11y:coverage`, `--repeat-each=3`) rather than guessing from prose. It has no `edit`, writes
  nothing, and its rules forbid changing the repository.
- **`todo` and `todos` are both listed.** VS Code documents `todo`; Defra's guidance uses `todos`
  and `thinking`. Unknown tool names are ignored, so listing both means the agent gets the tool
  whatever the editor calls it.
- **GitHub Actions only.** Use `gha-pipeline` for CI. In `E2E_PROTOTYPE=true` mode, defer
  workflow creation until CI is requested and keep the local traceability, test and
  accessibility checks.
- **No `model:` key.** Model availability differs per subscription and organisation approval, so
  pinning is left to the picker (README step 3) instead of a value that goes stale.

## Install

1. Unzip. Run the installer with the path to your repository:
   - macOS, Linux or Git Bash: `bash install.sh /path/to/repo`
   - Windows PowerShell: `powershell -ExecutionPolicy Bypass -File install.ps1 -Repo C:\path\to\repo`
   - Manual: copy `github/*` into `<repo>/.github/` and merge `ignore.txt` into `<repo>/.gitignore`
2. Remove files from older versions first: `.github/e2e.instructions.md`, the old
   `sample_ado_test_cases.csv`, and any stale agent or skill file. The installer backs up what it
   replaces under `.github/.backup-<timestamp>/`, so nothing is lost silently.

### Set up the workspace (VS Code)

1. Keep the application source out of reach:
   ```json
   "files.readonlyInclude": { "src/**": true, "app/**": true, "server/**": true }
   ```
   This is the mechanism that actually prevents edits. `.copilotignore` is **not** read by
   Copilot — see "Keeping the app out of context" below.
2. Leave terminal auto-approval off; the pack runs `npm`, `npx` and `python`, and you want to see each one.
3. Pin models in the agent picker, per agent. Discovery, planning and review deserve the
   strongest model; test-case writing and scaffolding tolerate a mid-tier one. If you pin with
   the `model:` field, use an ID from the editor's completions — IDs differ per harness.
4. Enable Agent Skills: add `"chat.agent.skills": true` to your **user** settings
   (`Preferences: Open User Settings (JSON)`). Defra's Copilot guidance lists this as a required
   local setup step for every developer, because without it the editor ignores `.github/skills/`.
   It is user-level, not workspace-level, so it cannot be committed for the team.
5. Python 3 is needed for the converter; Node.js 20 or later for everything else.

## Start

`e2e-architect` asks for these and will not analyse anything without 1 and 2:

1. **Source Code Path** — path, repository URL or workspace location. Required.
2. **Application Base URL** — Development, Test, Staging or Production. Required.
3. **Requirements Path** — requirements, BRD, FRD, user stories, design docs. Optional; if there
   are none, test cases trace to criteria derived from the code and crawl, with the evidence cite.

```
Source: <path>. Base URL: <url>. Requirements: <path or none>. Auth: <mechanism>. UI_PROFILE=legacy.
Run steps 1 and 2 for feature <X> only.
```

Inputs are recorded in `test/journey/docs/00-status.md` (no credentials), so later chats resume
without re-asking. Approvals are recorded in `test/journey/docs/approvals.json` — the only place
they count.

## Flow

1. **Scaffold the harness** — copy the scaffold into `test/journey/`, `npm ci`, install chromium.
   No feature, page or step is written yet; this exists so the crawl and the gates can run.
2. **Discover** — source analysis plus a read-only crawl (`crawl.mjs`), producing
   `docs/discovery/` and a profile-tagged `data/page-inventory.json`.
3. **Plan** — `docs/02-test-plan.md`, then you reply `APPROVED: <scope>`.
4. **Test cases** — `e2e-testcase-writer` writes `<f>.json` and converts to `<f>.csv`; you reply
   `TESTCASES APPROVED: <feature>`, which the architect records in `approvals.json`.
5. **Build** — one vertical slice per approved feature, from the JSON, never the CSV.
6. **Verify** — the gates below, all run for real.
7. **Review** — `e2e-reviewer` audits and returns a verdict; Blocker and Major findings are fixed.
8. **Pipeline** — one `.github/workflows/e2e-journey.yml` GitHub Actions workflow.

## The gates

Nothing in this pack relies on the model remembering a rule if a script can decide it.

| Gate | Command | Fails on |
|---|---|---|
| Approvals + traceability + CSV freshness | `npm run trace` | an unapproved feature, a missing or byte-stale CSV, a title that drifted, a scenario with no test case |
| Grounding | `npm run grounding` | a page locator, endpoint or content entry with no `// source:` |
| Accessibility violations | `npm test` | a violation not recorded in `docs/a11y-baseline.json`, in either profile (`A11Y_FAIL_ON_NEW` defaults to true) |
| Accessibility coverage | `npm run a11y:coverage` | an inventory route never scanned, templated or waived |
| Migration readiness | `npm run readiness -- --strict` | a `legacy-only` marker with no register row, or a row with no marker |
| Lint | `npm run lint` | a fixed sleep, `.only`, `.skip` |

## Requirement coverage

| Your requirement | How v2 meets it | How it is proven |
|---|---|---|
| 1. Test cases in CSV from source + crawled URL, with edge cases | JSON is the source of truth; the converter owns the CSV layout; dual AC/derived tracing; boundary, negative and role scenarios required per feature | Converter validation, `--check` byte comparison, trace-check gate in CI |
| 2. Playwright/JS automation from source + crawled URL | Runnable scaffold: config with `defineBddConfig`, fixtures, per-role auth, seeded builders, API client, content maps | `bddgen` + `playwright test`, lint, grounding gate |
| 3. axe-core scans alongside 2 | Scan inside `expectPageLoaded` on every page, deduplicated across workers, coverage gate, legacy baseline, separate HTML/JSON report | `a11y:coverage`, `a11y:report`, pipeline job per profile |
| 4. GitHub Actions workflow | Matrix over profiles, `@smoke`/`@regression` selection, JUnit, accessibility and failure artefacts, traceability gate | YAML review; the workflow itself is `NOT VERIFIED` until it runs in GitHub |
| Smartness: same tests on legacy and GDS | `UI_PROFILE` validated at import; `byProfile` with no fallback; 14 GDS component wrappers (input, date, radios, checkboxes, character count, summary list, file upload, task list, details, table, tag, error summary, cookie banner, skip link); text helpers for visually hidden prefixes; cookie banner and skip link handled; profile-tagged inventory; readiness metric; dual-profile matrix | `readiness` reports the actual shared-locator percentage; the `gds` matrix leg is the proof |

What this does **not** give you: a claim that the suite already passes on both UIs. The pack now
makes the divergence measurable and forces it into one layer; the 95% is confirmed by running the
`gds` leg, not by reading the README.

## Keeping the app out of context

Defra's guidance uses `.copilotignore` for context exclusion and pairs it with a warning that it does
not stop Git tracking. GitHub's own documentation describes content exclusion as an administrator
setting and is cautious about agent mode, so the file is written but nothing is trusted to it. Three
things do the real work:

1. `install.sh` merges `ignore.txt` into **`.gitignore`**, so session tokens in `.auth/`, reports
   and `.env` cannot be committed. That is the part that matters for assurance.
2. `files.readonlyInclude` keeps the application source read-only in the editor.
3. Anything genuinely sensitive belongs behind organisation content exclusion, and secrets belong
   in a secret store — never in the workspace.

`.copilotignore` is still written from the same list, because Defra's guidance and other compatible
tools read it; it is not relied on for anything that matters.

## Open points

- Cucumber vs `playwright-bdd`: the pack uses `playwright-bdd`; Defra's examples list Cucumber.
  Confirm before rollout. Switching changes the scaffold, not the skills.
- Folder name: `test/journey/`, which is what Defra's own testing instructions prescribe
  ("Place Playwright journey tests in `test/journey/`"). The Tester agent example on the same site
  says `/tests`; the instructions file wins, and this pack follows it. Switching to `/tests` is one
  find-and-replace plus the two config paths.
- The workflow has not been run in a real GitHub repository, and `automation-map --push` has not
  been exercised against a live Azure DevOps organisation. Both are marked `NOT VERIFIED` and
  should be tried before rollout. The GitHub workflow is the only supported CI workflow; ADO
  references remain only for optional Test Plans CSV export and automation mapping.
- The accessibility scan and report templates were exercised against fixtures, not a live GDS
  service. Run them once against the pilot before relying on the numbers.

## Versioning

`v1/` is the previous pack. `v2/` is this one. `GAP-ANALYSIS.md` (repository root) is the review
that separates them; `v2/CHANGELOG.md` maps each finding to its fix.
