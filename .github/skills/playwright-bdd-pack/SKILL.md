---
name: playwright-bdd-pack
description: Standards, folder layout and Definition of Done for generating a Playwright + JavaScript (ES modules) Gherkin BDD (playwright-bdd) + Page Object Model journey-test pack with API clients, flows, auth state reuse, data builders and hybrid UI+API validation. Use when generating, extending or reviewing journey tests, page objects, flows, step definitions, feature files or Playwright config.
metadata:
  version: "1.1"
compatibility: Requires Node.js LTS, Playwright and playwright-bdd
---

# Playwright + BDD pack

Rules for locators, assertions, data and security live in `journey-tests.instructions.md`. This skill covers structure and delivery only.

## Layout (inside `test/journey/`, self-contained)

```
features/{domain}/*.feature     steps/{domain}/*.steps.js
pages/  components/  flows/     api/  data/  assertions/
support/   fixtures.js  env.js  profiles.js  page-key.js  a11y.js  a11y-setup.js  a11y-report.js
content/   labels.js  messages.js  routes.js
scripts/   trace-check.js
docs/      00-status.md  discovery/  test-cases/  02-05 reports
.auth/ and reports/ (gitignored)
package.json  playwright.config.js  .env.example  README.md
```

## Templates (copy, never retype)

```
cp .github/skills/gds-migration-resilience/templates/profiles.js test/journey/support/
cp .github/skills/a11y-page-scan/templates/*.js test/journey/support/
cp .github/skills/ado-testcase-csv/scripts/trace-check.js test/journey/scripts/
```

Scaffolding is identical across projects. After the first project, copy its `test/journey` scaffold (config, fixtures, support, scripts) into the next project instead of regenerating it.

`package.json` scripts: `bdd` (`bddgen && playwright test`), `lint`, `trace` (`node scripts/trace-check.js`), `a11y:report` (`node support/a11y-report.js`).

## Runner

Use `playwright-bdd`. Steps use `createBdd(test)` with the custom `test` from `support/fixtures.js`. Run `npx bddgen && npx playwright test`. Use ES modules and `"type": "module"`. Do not mix in another runner.

If your Defra standards require the `@cucumber/cucumber` runner, record that under Open Questions and ask before switching.

## Layers

- **Components and pages:** locators and actions only. Extend `BasePage`. No assertions.
- **Flows:** business tasks (`applicantFlow.complete(data)`). A flow decides how many pages a task takes.
- **API clients:** one per resource on `APIRequestContext`. Validate responses with zod or ajv. Describe payloads with JSDoc `@typedef`. Retry on 5xx only.
- **Steps:** thin. Call flows, pages and clients.
- **Data builders:** seeded `@faker-js/faker` builders that read constraints from the discovery doc. Offer valid, boundary and invalid variants. Log the seed on failure.
- **Content maps:** every label, message and route lives in `content/`, never in steps.

## State and auth

- Create preconditions through the API. Register each created entity with a teardown fixture.
- Prefix data with a run id so a sweeper can remove strays.
- Log in once per role in a setup project. Save `storageState` to `.auth/{role}.json`. Select it with an `@role:<name>` tag. Keep an unauthenticated path for login and permission scenarios.
- Default to the real backend. Use `page.route()` only for forced 4xx/5xx, timeouts, empty states and third-party calls. Tag these `@mocked` and explain why.

## Hybrid validation

- After a UI mutation, verify persistence through the API. After an API mutation, verify the UI.
- Assert status, headers, body schema and business rules in `@api` scenarios.
- Where a rule is client-only, add an API scenario that proves the server enforces it, or log a defect.

## Gherkin

Write declarative, business-readable steps with no UI mechanics. Use `Background` for shared setup, `Scenario Outline` for data-driven cases and one behaviour per scenario. Tags: `@smoke @regression @api @ui @hybrid @negative @boundary @mocked @a11y @role:<name> @feature:<name> @wip`.

## Definition of Done

- [ ] `eslint`, `bddgen` and `playwright test --list` pass; tests ran and results are reported
- [ ] JavaScript only; no TypeScript, `.skip`, `.only` or fixed sleeps
- [ ] No assertions in pages; no locators, URLs or text literals in steps
- [ ] Every legacy-only locator is inside `byProfile` and listed in `05-migration-register.md`
- [ ] Scenarios are independent, parallel-safe, clean up, and stable over `--repeat-each=3`
- [ ] Happy, negative, boundary and permission cases per feature
- [ ] Client-side and server-side validations both covered
- [ ] Every in-scope endpoint has an API scenario with schema validation
- [ ] Every catalogue row has a test case; `trace-check` reports no problems
- [ ] `a11y-report` generated; `duplicatesSkipped` and `unscannedPages` explained
- [ ] Keyboard and focus checks exist per journey
- [ ] Test data is synthetic; no secrets or `.auth/` committed
- [ ] Every locator, endpoint and rule has a `// source:` comment
- [ ] SonarCloud quality gate (SonarWay) passes for the new code
- [ ] README commands match `package.json` scripts

## References

- [Defra Copilot configuration examples](https://defra.github.io/defra-ai-config-examples/)
- [playwright-bdd](https://vitalets.github.io/playwright-bdd/)
