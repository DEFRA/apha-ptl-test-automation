# Journey tests

Playwright + `playwright-bdd` + Page Object Model, for one service with two UI profiles
(`legacy` and `gds`). Steps are plain JavaScript (ES modules); there is no TypeScript.

## First run

```
npm ci
cp .env.example .env        # fill in the URLs and credentials; playwright.config.js loads it with dotenv
npx playwright install      # once per machine
npm run auth                # writes .auth/<role>.json
npm run bdd
```

## Commands

| Command | What it does |
|---|---|
| `npm run bdd` | generate tests from `features/` + `steps/`, then run them |
| `npm run smoke` | run only `@smoke` |
| `npm run regression` | run only `@regression` |
| `npm run feature -- @feature:applicant-details` | one feature |
| `npm run role -- anonymous` | one role project (`journey`, `admin`, `anonymous`) |
| `npm run auth` | refresh saved sessions |
| `npm run lint` | ESLint, including the no-sleep / no-only / no-skip rules |
| `npm run trace` | approvals, test-case↔scenario traceability, CSV freshness |
| `npm run grounding` | every endpoint, page locator and content entry cites `// source:` |
| `npm run readiness` | profile-dependency and legacy-only marker report |
| `npm run a11y:report` | rebuild the accessibility HTML and JSON report |
| `npm run a11y:coverage` | every inventory route scanned, templated or waived |
| `npm run a11y:baseline` | diff (or `--update`) the legacy accessibility baseline |
| `npm run automation:map` | link ADO test cases to their JUnit results |

## Layout

```
features/{domain}/<f>.feature    one per docs/test-cases/<f>.json
steps/{domain}/*.steps.js        thin: call flows, pages and clients
pages/  components/  flows/       locators, GOV.UK widgets, business tasks
api/    data/    assertions/      REST clients, seeded builders, shared assertions
content/                          every label, message, route and page heading
support/                          env, fixtures, profiles, a11y, text helpers
scripts/                          trace-check, grounding, readiness, a11y helpers, automation map
docs/                             discovery, plan, test cases, approvals, reports
```

`content/` is the migration surface. After the cutover, only `content/`, `components/` and
`flows/` should need to change; steps and feature files must not.

## Two profiles

`UI_PROFILE=legacy|gds` selects the UI. A value that is not one of those throws at import.
`byProfile` requires the active profile's key, so a forgotten `gds` variant fails at first use
rather than quietly running a legacy selector against the new UI.

## Notes

- `.auth/`, `reports/` and `.features-gen/` are generated and git-ignored.
- `docs/approvals.json` is the approval ledger; do not hand-edit it, and never build a feature
  that is not approved there.
- The example feature in `features/_example/` is tagged `@wip` and is excluded from runs.
  Delete it once real features exist.
