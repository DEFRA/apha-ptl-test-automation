---
name: gds-migration-resilience
description: Locator, page object, content-map and profile strategy that keeps Playwright journey tests working when a legacy web application is migrated to the GOV.UK Design System. Use when writing or reviewing locators, page objects, flows, UI profiles, content maps or a migration register, or when planning the GDS cutover of UI tests.
metadata:
  version: "1.0"
compatibility: Requires Playwright; target UI uses GOV.UK Frontend 5.x or later
---

# GDS migration resilience

## What changes in the migration

Expect these to change, and design so only one place needs editing:

- Markup, ids and classes (GOV.UK Frontend components replace custom widgets)
- Wording: buttons (`Submit` to `Continue`), labels, error messages, page titles
- URLs and page count: GDS favours one question per page
- Errors: an error summary at the top plus an inline message per field
- Components: date input becomes three fields; autocomplete and pickers are replaced

## Rule 1: Anchor on what survives

Prefer roles, accessible names, labels and headings. They exist in both UIs and are what GDS guarantees. Use the locator order in `journey-tests.instructions.md`.

✅ `form.getByLabel(labels.email)`
❌ `page.locator('#ctl00_txtEmail')`

## Rule 2: One place for every string

Keep labels, messages and routes in `content/`, keyed by logical name. Steps and pages read the key. They never contain the text.

```javascript
// content/labels.js
import { byProfile } from '../support/profiles.js'
export const labels = {
  continue: byProfile({ legacy: 'Submit', gds: 'Continue' }),
  email: 'Email address'
}
```

✅ `getByRole('button', { name: labels.continue, exact: true })`
❌ `getByRole('button', { name: 'Submit' })` in a step

## Rule 3: Explicit profiles, never auto-detect

Select the UI with `UI_PROFILE=legacy|gds`. Use `byProfile` only where the DOM genuinely differs. Mark every legacy branch.

```javascript
// support/profiles.js
export const PROFILE = process.env.UI_PROFILE ?? 'legacy'
export const byProfile = (variants) => variants[PROFILE] ?? variants.common

// pages/applicant.page.js
get dateOfBirth() {
  return byProfile({
    legacy: this.form.locator('#dob'), // legacy-only: remove at GDS cutover
    gds: this.form.getByRole('group', { name: labels.dateOfBirth })
  })
}
```

✅ One explicit profile per run, so failures name the exact difference
❌ `legacyLocator.or(gdsLocator)` or try/catch fallbacks, which hide real defects

## Rule 4: Flows own the page count

Write steps against business tasks. Let the flow decide whether the task is one page or three.

```javascript
// flows/applicant.flow.js
async complete(applicant) {
  if (PROFILE === 'legacy') {
    await this.legacyDetails.fillAll(applicant) // legacy-only: remove at GDS cutover
  } else {
    await this.name.enter(applicant.name)
    await this.email.enter(applicant.email)
  }
}
```

## Rule 5: Identify pages by heading, not URL

Assert the `h1` against `content/`. Match the page-name part of the `<title>`. Do not hard-code separators.

✅ `await expect(page.getByRole('heading', { level: 1 })).toHaveText(content.pages.details.heading)`
❌ `await expect(page).toHaveURL('/ApplicantDetails.aspx')`

## Rule 6: Assert errors by meaning

Assert the message from `content/messages.js` and its link to the field. In `gds`, check the error summary link `href` matches the field id and the inline message exists. In `legacy`, check the inline message beside the field.

## Rule 7: Wrap components

Put widgets that change shape (date input, address lookup, autocomplete) in `components/`. Give each one a profile-aware `fill()`. Pages call `fill()`.

## Rule 8: Accessibility differs by profile

Run axe on both. In `legacy`, attach results and do not fail; treat findings as migration backlog. In `gds`, fail on violations. Record manual checks (screen reader, 320px, 400% zoom) as `NEEDS MANUAL TEST`.

## Migration register

Maintain `test/journey/docs/05-migration-register.md`. Add one row per `legacy-only` marker: `file:line | what it does | gds replacement | status`.

## Cutover procedure

1. Branch. Set `UI_PROFILE=gds`.
2. Run the suite. Fix failures only in `content/`, `byProfile` overrides, components and flows.
3. Delete every `legacy-only` branch and the `legacy` keys. Empty the register.
4. Switch axe to fail on violations for all pages.
5. Run `e2e-reviewer` and confirm no markers remain.

## Must not

- Use XPath, `nth`, index or position selectors, or legacy ids and classes outside `byProfile`
- Put URLs or visible text in steps
- Assert on CSS classes used for styling
- Add fallbacks that pass on either UI

## References

- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/)

## Template

Copy `templates/profiles.js` to `test/journey/support/` with `cp`. Do not retype it.
