# Scripts

These are the gates. They are copied from the skills, not written here, so every project runs
the same code:

```
cp .github/skills/ado-testcase-csv/scripts/trace-check.js              scripts/
cp .github/skills/ado-testcase-csv/scripts/automation-map.js           scripts/
cp .github/skills/playwright-bdd-pack/templates/scripts/check-grounding.js scripts/
cp .github/skills/a11y-page-scan/templates/scripts/*.js                scripts/
cp .github/skills/gds-migration-resilience/templates/scripts/*.js      scripts/
cp .github/skills/gha-pipeline/templates/ci-summary.js                  scripts/
```

| Script | Run with | Fails on |
|---|---|---|
| `trace-check.js` | `npm run trace` | missing approval, missing/stale CSV, title drift, unmatched scenario |
| `check-grounding.js` | `npm run grounding` | a locator, endpoint or content entry with no `// source:` |
| `a11y-coverage.js` | `npm run a11y:coverage` | an inventory route never scanned, templated or waived |
| `a11y-baseline.js` | `npm run a11y:baseline` | (reporting) new legacy violations; `--update` refreshes |
| `migration-readiness.js` | `npm run readiness` | orphan `legacy-only` markers or register rows (`--strict`) |
| `automation-map.js` | `npm run automation:map` | (reporting) test cases with no scenario; `--push` sets ADO fields |
| `a11y-ado-summary.js` | pipeline | nothing: prints the ADO attachment and summary commands |

Do not edit these in a project. If one needs changing, change it in the skill and re-copy, so the
next project inherits the fix.
