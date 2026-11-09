---
applyTo: "test/journey/**"
---

# Journey tests (Playwright + JavaScript)

The Defra rules in `testing.instructions.md` also apply (BDD naming, no `.skip` or `.only`, independent tests). The rules below add journey-test detail.

## Language and layers

- Write plain JavaScript as ES modules. Do not add TypeScript. Describe shapes with JSDoc `@typedef`.
- Keep pages and components to locators and actions. Keep assertions in steps or `*.assertions.js`.
- Compose pages into business tasks in `flows/`. Call flows from steps.

✅ `await applicantFlow.complete(applicant)` in a step
❌ `await page.locator('#fname').fill('Jane')` in a step

## Locators

Use this order:

1. `getByRole(role, { name, exact: true })`
2. `getByLabel(...)`
3. A scoped `.govuk-*` class selector inside a parent locator
4. `getByText(...)` as a last resort

Scope every locator to its containing parent. Put legacy-only selectors in a `byProfile` override (see skill `gds-migration-resilience`).

✅ `form.getByRole('button', { name: labels.continue, exact: true })`
❌ `page.locator('div:nth-child(3) > a')`

## Waiting and assertions

Use web-first assertions. Do not use fixed sleeps.

✅ `await expect(heading).toBeVisible()`
❌ `await page.waitForTimeout(2000)`

## Test data

Use synthetic data only: `Jane Smith`, `test@example.com`, `AB12 3CD`. Generate unique values per scenario from a seeded builder. Never use real names, NI numbers, bank details, phone numbers or addresses.

✅ `buildApplicant({ seed })` returns `test+<runId>@example.com`
❌ A copied production record in a fixture

## Isolation

- Give every scenario a fresh browser context and its own data.
- Create preconditions through the API and clean up in fixture teardown.
- Make scenarios pass in any order and in parallel.

## Security and privacy

- Read URLs and credentials from `support/env.js`. Never hard-code them.
- Keep `.auth/` and `reports/` out of git. They hold session tokens and screenshots.
- Do not log personal data. Capture traces on retry only.

## Accessibility

Scan each page once through `expectPageLoaded` (skill `a11y-page-scan`). Do not call axe in steps. Do not scan the same route and variant twice. Results go to the separate report `reports/a11y/a11y-report.html`, not the Playwright report. Test keyboard navigation and focus after errors. Fail on violations when `UI_PROFILE=gds`. Report only when `UI_PROFILE=legacy`.

✅ `await expectPageLoaded(page, { heading: content.pages.details.heading })`
❌ `await new AxeBuilder({ page }).analyze()` in a step

## Traceability

Write one Scenario per test case in the catalogue. Use the same title and tag it `@TC-001`. Keep Gherkin declarative; the CSV holds the click-level steps.

## API checks

Cover these for every route in scope, where the app implements them: happy path, validation failure (400), missing or invalid credentials (401, 403), not found (404), CSRF token rejection, and security headers (`X-Content-Type-Options`, `Referrer-Policy`, HSTS, CSP).

## Naming

Name features and scenarios by behaviour: `Scenario: Applicant cannot continue without an email address`. Do not name them `test1` or `works`.
