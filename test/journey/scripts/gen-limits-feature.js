// Generates features/internal/internal-limits.feature from docs/internal/discovery/pages.json (run scripts/probe-internal.mjs first).
import fs from 'node:fs'

const pages = JSON.parse(fs.readFileSync('docs/internal/discovery/pages.json', 'utf8'))
const paths = [
  '/Search/Index', '/Customer/Create', '/GroupAddress/Create', '/Scheme/Create', '/Scheme/Search',
  '/SystemAdministration/ExternalTestConsultantManagement', '/SystemAdministration/ViewerManagement',
  '/SystemAdministration/CountryManagement', '/SchemeAdmin/TestResultItemType', '/SchemeAdmin/TestMethodItemType', '/Distribution/Search'
]
const rows = []
for (const path of paths) {
  const seen = new Set()
  for (const form of pages[path]?.forms ?? []) {
    for (const f of form.fields) {
      if (!f.maxlength || !f.label || f.type === 'hidden' || seen.has(f.label)) continue
      seen.add(f.label)
      rows.push([path, f.label, f.maxlength])
    }
  }
}
const pad = (s, n) => String(s).padEnd(n)
const w = [Math.max(...rows.map((r) => r[0].length)), Math.max(...rows.map((r) => r[1].length)), 3]
const table = rows.map((r) => `      | ${pad(r[0], w[0])} | ${pad(r[1], w[1])} | ${pad(r[2], w[2])} |`).join('\n')

const feature = `@feature:internal-limits @role:internal
Feature: Internal form field limits
  Every text field that the source limits has the matching maxlength in the browser.
  Generated from the live probe (scripts/gen-limits-feature.mjs); source: StringLength attributes in the *ViewModel.cs files.

  @TC-INT-060 @regression
  Scenario Outline: Text field accepts at most the documented number of characters
    When the user goes to "<path>"
    Then the first field labelled "<field>" accepts at most <max> characters

    Examples:
      | ${pad('path', w[0])} | ${pad('field', w[1])} | max |
${table}
`
fs.writeFileSync('features/internal/internal-limits.feature', feature)
console.log(`${rows.length} field limits written`)
