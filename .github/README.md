# Copilot E2E Agent Pack v2

Playwright + JavaScript, Gherkin BDD, Page Object Model, GOV.UK-migration-ready locators, an
exhaustive scenario catalogue that drives the ADO test-case CSV, gated axe-core accessibility scans,
and an Azure DevOps pipeline that proves both UI profiles. The agent runs the flow unattended:
discover everything, write every test case, build every scenario, then execute once at the end.

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
  api-ui-discovery/        source + read-only crawl (depth 5, 200 pages, every control and every
                           field rule) that inventories every action, not just URLs; scenario
                           candidates per feature and a two-way route reconciliation
  ado-testcase-csv/        JSON → CSV converter, trace-check, automation map
  playwright-bdd-pack/     standards and the layout the agent scaffolds
  gds-migration-resilience/ validated profiles, GDS text helpers, 14 component wrappers
  a11y-page-scan/          deduplicated scans, coverage gate, legacy baseline, report
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
| Prefer tool sets (`edit`, `execute`, `read`, `search`, `web`, `agent`); add `todos` for multi-step agents | architect `['*']` and the two workers narrow — see deviations; only documented aliases are used |
| Omit `edit` and `execute` for a read-only reviewer | reviewer has no `edit` (see deviations) |
| Instructions: one file per concern, imperative, one example and one counter-example per rule, under 200 lines, `applyTo` globs | `copilot-instructions.md` (repository), `testing.instructions.md` (Defra's file, adapted), `journey-tests.instructions.md` (journey detail) — all well under the limit |
| Skills: `.github/skills/{name}/SKILL.md`, `name` matching the folder, description with activation keywords, `metadata`, `compatibility`, under 500 lines | six skills; frontmatter matches the format, the largest is 193 lines |
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
- **The architect gets `*`; the workers stay narrow.** Copilot documents exactly seven aliases —
  `execute`, `read`, `edit`, `search`, `agent`, `web`, `todo` — and ignores everything else, so
  `findTestFiles`, `usages`, `changes`, `todos` and `thinking` were being dropped without a word.
  The lead agent must also reach whatever browser, MCP or extension tools your editor exposes, so it
  selects all tools; the prompt's `## Operating mode` and `## Discovery contract`, not a narrow tool
  list, are what bound it. The writer keeps `[edit, execute, read, search, web, todo]` and the reviewer keeps
  `[execute, read, search, web, todo]` with no `edit`.
- **Azure DevOps, not GitHub Actions.** Defra's examples are GitHub-centric; the requirement here
  is an ADO pipeline, so `ado-pipeline` is the only CI artefact.
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
2. Turn auto-approval on for the session — `vscode/settings.json` if your download ships it (the
   installer copies it), otherwise `/autoApprove` — then reload the window. It auto-approves the
   pack's own commands while keeping `false` rules on `rm`, `git push`, `git reset`, `git clean`,
   `curl` and `wget`. Leaving auto-approval off is what produced a prompt on every page and every
   file — see "Autonomy: no approval steps".
3. Pin models in the agent picker, per agent. Discovery, planning and review deserve the
   strongest model; test-case writing and scaffolding tolerate a mid-tier one. If you pin with
   the `model:` field, use an ID from the editor's completions — IDs differ per harness.
4. Enable Agent Skills: add `"chat.agent.skills": true` to your **user** settings
   (`Preferences: Open User Settings (JSON)`). Defra's Copilot guidance lists this as a required
   local setup step for every developer, because without it the editor ignores `.github/skills/`.
   It is user-level, not workspace-level, so it cannot be committed for the team.
5. Python 3 is needed for the converter; Node.js 20 or later for everything else.

## Autonomy: no approval steps

The first build of this pack caused exactly the failure it exists to prevent: an agent that stopped
for approval on nearly every action, and a suite that never got finished. Three things fix it, and
all three are needed.

1. **Editor auto-approval.** The installer copies `vscode/settings.json` to `.vscode/settings.json`
   when the download includes it: `chat.permissions.default` is `autoApprove`, and
   `chat.tools.terminal.autoApprove` allows the pack's own commands — `npm`, `npx bddgen`,
   `npx playwright`, `npx eslint`, `node scripts/*`, the ADO converter, copying a template, read-only
   git — while keeping `false` rules on `rm`, `git push`, `git reset`, `git clean`, `curl`, `wget` and
   privilege wrappers. This copy of the pack has no `vscode/` folder, so run `/autoApprove` at the
   start of the session instead; reload the window after installing settings either way.
2. **The agent prompts are the contract.** `## Operating mode` in `e2e-architect` (followed by
   `## Discovery contract`) gives the standing permissions, the three stop conditions, "decide instead
   of ask", one pass per phase and one report at the end. Where your install also carries
   `.github/instructions/autonomy.instructions.md`, it says the same to every agent; this copy does
   not, and the prompt is what binds the run.
3. **The lead agent has the tools the run needs** — `edit`, `execute`, `read` and `search`, so it can
   read the application, run the crawl and write the pack. Add `<server>/*` for a Playwright or
   browser MCP server; no settings key covers MCP approval.

What still stops a run, and should:

| Stop | Why |
|---|---|
| a missing Source Code Path, Base URL or auth mechanism | nothing can be discovered without them |
| a destructive command, an out-of-workspace write, Production data or a secret | irreversible or unsafe |

There is no plan approval, no test-case approval, no per-feature check-in and no review gate: the run
finishes every feature and reports once at the end. If the agent stops for one of those, it is running
an older copy of the pack. If it asks for anything outside the table, auto-approval did not load or the
workspace is not trusted — check the settings before you answer it.

**MCP and browser tools.** If your editor exposes a Playwright or browser MCP server, add it to the
agent's tools as `<server>/*` and trust it once with **Chat: Manage Tool Approval**. No settings key
covers MCP approval.

## Start

`e2e-architect` asks for these and will not analyse anything without 1 and 2:

1. **Source Code Path** — path, repository URL or workspace location. Required.
2. **Application Base URL** — Development, Test, Staging or Production. Required.
3. **Requirements Path** — requirements, BRD, FRD, user stories, design docs. Optional; if there
   are none, test cases trace to criteria derived from the code and crawl, with the evidence cite.

```
Source: <path>. Base URL: <url>. Requirements: <path or none>. Auth: <mechanism>. UI_PROFILE=legacy.
Run the whole flow for the whole application.
```

Inputs are recorded in `test/journey/docs/00-status.md` (no credentials), so later chats resume
without re-asking. There is no approval ledger: once the inputs are known the agent discovers, writes
every test case, builds every scenario and executes once, then reports. Decisions it had to make
alone are listed in `00-status.md` and the build report, with the counts that justified them.

## Flow

1. **Scaffold the harness** — create `test/journey/` from the layout in `playwright-bdd-pack` (copying
   its templates where your download ships them), `npm ci`, install chromium. No feature, page or step
   is written yet; this exists so the crawl and the gates can run.
2. **Discover** — source analysis plus a read-only crawl (the pack's `crawl.mjs` where present,
   otherwise a script the agent writes into `test/journey/scripts/`) that records every control on
   every page, classifies what it does and checks its destination loaded; it produces
   `docs/discovery/`, a profile-tagged `data/page-inventory.json` whose operations cite either a
   crawl affordance or a source line, and the form contract (`required`, `pattern`, `maxlength`,
   `range`, `email`) that `npm run validations` holds the cases to. It covers the whole application,
   not the first feature, and reconciles router routes against crawled pages in both directions.
3. **Catalogue** — `docs/01-scenario-catalogue.md` and `docs/scenarios.json`: one row per discovered
   behaviour with its evidence, then `docs/02-test-plan.md` built from them. Nothing is approved and
   nothing waits for approval.
4. **Test cases** — `e2e-testcase-writer` expands **every** catalogue row to `<f>.json` and converts
   it to `<f>.csv`, for every feature, before automation starts.
5. **Build** — every feature, one vertical slice at a time, from the JSON, never the CSV. Nothing is
   executed while building: `eslint`, `bddgen` and `--list` prove a slice compiles.
6. **Execute once** — one whole-suite run at the end, then the gates below, all run for real.
7. **Review** — optional: `e2e-reviewer` audits and returns a verdict; Blocker and Major findings are
   fixed. Never a gate, never a reason to stop.
8. **Pipeline** — one `azure-pipelines.yml`, registered at `/test/journey/azure-pipelines.yml`.

## Token economy

A long run is limited by credit, so both agents carry a `## Token economy` section: plan before
reading, search and open a 40–80 line window instead of whole files, one pass per phase, batch tool
calls, never echo file contents, cap command output, and stop when the deliverable exists. Every
artefact has a cap — discovery `index.md` ≤ 40 lines, `00-status.md` ≤ 10, the build report ≤ 40, one
line per catalogue row — and `00-status.md` is written after each phase so an interrupted run resumes
without re-reading anything.

Progress itself lives in `test/journey/docs/worklog.md`: append-only, one line per unit of work with
its phase, fingerprint (`git rev-parse --short HEAD`, base URL plus route count, or file mtime), counts,
result and artefact. The resume protocol reads that log first, so a unit logged `done` with the same
fingerprint is reused rather than re-crawled, re-scanned or re-read — a resumed run pays only for what
changed. The conversation is disposable: the log and the artefacts are the run's memory, so a fresh
session picks up from the last unfinished line instead of re-deriving counts from chat history.

Existing work is adopted, not redone. When a repository already has specs and CSV test cases but no
worklog, preflight backfills one `adopted` line per artefact — fingerprint plus mtime — verifies them
cheaply with `bddgen`, `--list` and `trace-check`, seeds the catalogue from the CSV rows (legacy `TC`
refs kept, `unverified` where evidence is missing) and automates only the gap.

## The gates

Nothing in this pack relies on the model remembering a rule if a script can decide it.

| Gate | Command in this download | Fails on |
|---|---|---|
| Traceability + CSV freshness | `node scripts/trace-check.js` (copied from the ADO skill) | a catalogue row with no test case, a missing or byte-stale CSV, a title that drifted, a scenario with no test case |
| Lint | `npx eslint test/journey` | a fixed sleep, `.only`, `.skip` |
| Compile | `npx bddgen` | a step or config the runner cannot load |
| Accessibility | `npx playwright test` then `node support/a11y-report.js` | a violation not recorded in the committed baseline, or a route never scanned |

**Not in this download.** `npm run pages`, `npm run validations`, `npm run grounding`, `npm run
readiness`, `npm run a11y:coverage`, the `crawl.mjs` template, the scaffold templates and the
`ado-pipeline` skill are the intended checks, not shipped scripts in this copy. The agent runs them
only when the target project's `package.json` defines them and reports the rest as `NOT IN PROJECT`;
nothing here claims they ran. Every statement about them is `NOT VERIFIED`.

## Requirement coverage

The proof column names the gate designed to enforce each requirement; see "Not in this download"
above for which of those commands this copy actually carries.

| Your requirement | How v2 meets it | How it is proven |
|---|---|---|
| 1. Test cases in CSV from source + crawled URL, with edge cases | JSON is the source of truth; the converter owns the CSV layout; dual AC/derived tracing; boundary, negative and role scenarios required per feature; a multi-value boundary is one case with `datasets` that renders one ADO case per value and a `Scenario Outline` in the feature file; a role matrix is `roles`, which renders one ADO case and one `@role:` scenario per role — never an `Examples` column, because auth state is per Playwright project | Converter validation, `--check` byte comparison, trace-check on dataset↔Examples and role↔scenario parity |
| 2. Playwright/JS automation from source + crawled URL | Runnable scaffold: config with `defineBddConfig`, fixtures, per-role auth, seeded builders, API client, content maps | `bddgen` + `playwright test`, lint, grounding gate |
| 3. axe-core scans alongside 2 | Scan inside `expectPageLoaded` on every page, deduplicated across workers, coverage gate, legacy baseline, separate HTML/JSON report | `a11y:coverage`, `a11y:report`, pipeline job per profile |
| 4. Azure DevOps pipeline | Matrix over profiles, `@smoke`/`@regression` selection, JUnit to Tests tab, accessibility and failure artefacts, six gates | YAML review; the pipeline itself is `NOT VERIFIED` until it runs in your ADO org |
| Smartness: same tests on legacy and GDS | `UI_PROFILE` validated at import; `byProfile` with no fallback; 14 GDS component wrappers (input, date, radios, checkboxes, character count, summary list, file upload, task list, details, table, tag, error summary, cookie banner, skip link); text helpers for visually hidden prefixes; cookie banner and skip link handled; profile-tagged inventory; readiness metric; dual-profile matrix | `readiness` reports the actual shared-locator percentage; the `gds` matrix leg is the proof |
| Every page's CRUD and search operations | discovery declares `read`, `search`, `create`, `update` and `delete` per page from evidence: a control the crawl saw performing it (an "Add", "Edit" or "Delete" link, a POST form, a search box) or a cited controller line; the plan writes `docs/page-operations.json`; test cases must perform each operation, not just open the screen | `npm run pages` fails on an operation with no affordance and no citation, and on one with no case and no dated waiver; the pipeline runs the same gate |
| Every mandatory form rule is validated | the crawl records each field's `required`, `pattern`, `maxlength`, `min`/`max` and `email` rule with its label; each rule is claimed by a case's `validation` array and proven by submitting the form, not by checking an attribute | `npm run validations` fails while a recorded rule is unowned, waived without an expiry, or claimed against a form that does not declare it |

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
- The pipeline has not been run in a real Azure DevOps organisation, and `automation-map --push`
  has not been exercised against a live one. Both are marked `NOT VERIFIED` and should be tried
  on one work item and one pipeline run before rollout.
- The accessibility scan and report templates were exercised against fixtures, not a live GDS
  service. Run them once against the pilot before relying on the numbers.

## Versioning

`v1/` is the previous pack. `v2/` is this one. `GAP-ANALYSIS.md` (repository root) is the review
that separates them; `v2/CHANGELOG.md` maps each finding to its fix.
