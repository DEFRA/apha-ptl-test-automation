---
name: a11y-page-scan
description: Adds deduplicated axe-core accessibility scanning to Playwright journey tests and builds a separate HTML and JSON accessibility report. Use when adding accessibility checks, scanning pages with @axe-core/playwright, avoiding duplicate page scans, or generating the accessibility report.
metadata:
  version: "1.0"
compatibility: Requires Playwright, @axe-core/playwright and Node.js 20 or later
---

# Accessibility page scan

The scan, duplicate detection and report are ready-made templates. Copy them. Do not retype or redesign them.

## Setup (once per project)

1. Ask before running `npm i -D @axe-core/playwright`.
2. Copy the templates (see `playwright-bdd-pack`): `a11y.js`, `a11y-setup.js`, `a11y-report.js`, `page-key.js` and `profiles.js` into `test/journey/support/`.
3. In `playwright.config.js` set `globalSetup: './support/a11y-setup.js'` and `globalTeardown: './support/a11y-report.js'`.
4. Confirm `data/page-inventory.json` exists (written during discovery).

## Use

Call one shared assertion when a step lands on a page. Scan an extra variant (`error`, `confirmation`, `empty`, `modal`) only when it changes the DOM materially.

```javascript
// assertions/page.assertions.js
import { expect } from '@playwright/test'
import { scanPage } from '../support/a11y.js'

export async function expectPageLoaded(page, { heading, variant = 'default', role = 'anonymous' }) {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
  await scanPage(page, { variant, role })
}
```

✅ `await expectPageLoaded(page, { heading: content.pages.details.heading })`
❌ `await new AxeBuilder({ page }).analyze()` in a step

## How duplicates are skipped

1. **Route key:** profile + normalised route + variant. The route is lower-cased, drops the trailing slash and query string, and turns id-like segments (numbers, UUIDs, references such as `ABC-1234`) into `:id`. So `/apply/123/details` and `/apply/456/details` are one page.
2. **Template key:** a fingerprint of the `h1`, landmarks and form control counts. Two routes with the same structure count as one template.

Workers share these keys by creating a file exclusively, so a page is scanned once per run across parallel workers. Skips are counted in the report.

| Variable | Default | Purpose |
|---|---|---|
| `A11Y_SCAN` | `true` | Set `false` to skip scanning |
| `A11Y_KEEP_PARAMS` | empty | Query parameters that select a different view, such as `tab,step` |
| `A11Y_DEDUPE_BY_TEMPLATE` | `true` | Set `false` to scan every distinct route |
| `A11Y_ENFORCE` | `true` for `gds`, else `false` | Fail the test on violations |
| `A11Y_DIR` | `reports/a11y` | Output folder |

## Report

`reports/a11y/a11y-report.html` and `a11y-summary.json`, separate from the Playwright report. They show totals, duplicates skipped, violations by impact and rule, per-page results with rule links and elements, and inventory pages that were never scanned. Rebuild with `npm run a11y:report`. To check results cheaply, read only `a11y-summary.json`.

## Must not

- Call axe in steps or loop over every link to scan it
- Scan against real personal data. Element snippets are stored in the report
- Call a clean scan WCAG compliance. Manual checks are still required
