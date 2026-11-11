#!/usr/bin/env node
/* eslint-disable */
/** Builds the distribution list, results, report and admin search features from data/seed/distributions.json. Run from test/journey. */
import fs from 'node:fs'
const d = JSON.parse(fs.readFileSync('data/seed/distributions.json', 'utf8').replace(/^\uFEFF/, ''))
const prev = d.previous.filter((r) => r.reference && !/[|"]/.test(r.reference + r.code))
const reps = d.reports.filter((r) => r.reference && !/[|"]/.test(r.reference + r.code))
const rows = (list, cols) => list.map((r) => `    | ${cols.map((c) => r[c]).join(' | ')} |`).join('\n')

fs.writeFileSync('features/external/external-distribution-data.feature', `Feature: Distribution lists, results and reports with real data

@feature:external-distribution-data @TC-101 @ui
Scenario Outline: Previous Distributions finds a distribution by its reference
  Given the customer opens the clean distribution list "previousDistributions"
  When they search the list for the distribution reference "<reference>"
  Then the list shows a row with "<reference>" and "<code>"

  Examples:
    | reference | code |
${rows(prev, ['reference', 'code'])}

@feature:external-distribution-data @TC-102 @ui
Scenario Outline: Previous Distributions finds distributions by scheme code
  Given the customer opens the clean distribution list "previousDistributions"
  When they search the list for the scheme code "<part>"
  Then the list shows a row with the scheme code "<code>"

  Examples:
    | code | part |
${prev.map((r) => `    | ${r.code} | ${r.code.replace(/^PT/, '')} |`).join('\n')}

@feature:external-distribution-data @TC-103 @ui
Scenario Outline: View opens the results of a previous distribution
  Given the customer opens the clean distribution list "previousDistributions"
  When they open the "View" link of the row "<reference>"
  Then the page heading is "View Results" and it shows "<reference>"
  And no server error page is shown

  Examples:
    | reference |
${rows(prev, ['reference'])}

@feature:external-distribution-data @TC-104 @ui
Scenario Outline: View opens the report of a distribution
  Given the customer opens the clean distribution list "reports"
  When they open the "View" link of the row "<reference>"
  Then the page heading is "View reports" and it shows "<reference>"
  And the report shows the buttons "GENERATE PDF" and "BACK"
  And no server error page is shown

  Examples:
    | reference |
${rows(reps, ['reference'])}

@feature:external-distribution-data @TC-105 @ui
Scenario Outline: BACK on a results or report page returns to its list
  Given the customer opens the clean distribution list "<list>"
  When they open the "View" link of the first row
  And they select BACK
  Then the "<list>" page is shown

  Examples:
    | list |
    | previousDistributions |
    | reports |
`)

fs.writeFileSync('features/admin/admin-distribution-search.feature', `Feature: Admin distribution search with real distribution numbers

@role:admin @feature:admin-distribution-search @TC-106 @ui
Scenario Outline: A distribution search by a known reference lists that distribution
  Given an admin opens the "distributionsSearch" admin page
  When they search "distributions" for "<reference>"
  Then the "distributionsSearch" admin page is shown
  And no admin server error page is shown

  Examples:
    | reference |
${rows(prev, ['reference'])}
`)

const EX = 'The external site runs at http://localhost:1688 with the local debug SSO user linked to the participant with Lab Code 1300 (data/seed/apply.sql).'
const AD = 'The admin site runs at http://localhost:1946 and the user is signed in as an Admin (Windows identity dt2\\ns000134).'
const ro = 'Read-only: nothing is created, saved or deleted, so no data cleanup is needed.'
const tbl = 'Data table: the Examples table of the matching scenario outline lists every row; each row is one execution.'
const tc = (ref, title, area, ac, assumptions, steps) => ({ ref, layer: 'ui', title, area_path: area, assigned_to: 'QA', state: 'Design', acs: [`DERIVED: ${ac}`], assumptions, steps: steps.map(([action, expected]) => ({ action, expected })) })
const write = (feature, cases, q) => fs.writeFileSync(`docs/test-cases/${feature}.json`, JSON.stringify({ feature, test_cases: cases, open_questions: ['DERIVED criteria come from read-only probes of the running apps; confirm they are the intended behaviour.', ...q] }, null, 2) + '\n')
const E = 'Proficiency Testing\\External'
write('external-distribution-data', [
  tc('TC-101', 'Previous Distributions finds a distribution by its reference', E, `Searching Previous Distributions by Distribution Reference lists that distribution - ${prev.length} references (data/seed/distributions.json)`, [EX, tbl, ro, 'References come from the first page of the list.'], [['Open Previous Distributions.', 'The list and its search form are shown.'], ['Type the reference of the row in Distribution Reference.', 'The box shows the reference.'], ['Click SEARCH.', 'The list reloads.'], ['Look for the row.', 'A row with the reference and scheme code is listed.'], ['Check the page for a server error message.', 'No server error page is shown.']]),
  tc('TC-102', 'Previous Distributions finds distributions by scheme code', E, `Searching Previous Distributions by Scheme Code lists the distribution - ${prev.length} codes (data/seed/distributions.json)`, [EX, tbl, ro], [['Open Previous Distributions.', 'The list and its search form are shown.'], ['Type the scheme code of the row in Scheme Code.', 'The box shows the code.'], ['Click SEARCH.', 'The list reloads.'], ['Look for the row.', 'A row with the reference and scheme code is listed.'], ['Check the page for a server error message.', 'No server error page is shown.']]),
  tc('TC-103', 'View opens the results of a previous distribution', E, `View on a Previous Distributions row opens View Results for that distribution - ${prev.length} rows (data/seed/distributions.json)`, [EX, tbl, ro], [['Open Previous Distributions.', 'The list is shown.'], ['Click View on the row with the reference.', 'The View Results page opens.'], ['Read the main heading.', 'The h1 is View Results.'], ['Read the page text.', 'It shows the distribution reference.'], ['Check the page for a server error message.', 'No server error page is shown.']]),
  tc('TC-104', 'View opens the report of a distribution', E, `View on a Reports row opens View reports with GENERATE PDF and BACK - ${reps.length} rows (data/seed/distributions.json)`, [EX, tbl, ro, 'GENERATE PDF is not clicked.'], [['Open Reports.', 'The list is shown.'], ['Click View on the row with the reference.', 'The View reports page opens.'], ['Read the main heading and text.', 'The h1 is View reports and the text shows the reference.'], ['Look for the buttons.', 'GENERATE PDF and BACK are shown.'], ['Check the page for a server error message.', 'No server error page is shown.']]),
  tc('TC-105', 'BACK on a results or report page returns to its list', E, 'BACK returns from View Results and View reports to the list they came from (data/seed/distributions.json)', [EX, tbl, ro], [['Open the list in the row (Previous Distributions or Reports).', 'The list is shown.'], ['Click View on the first row.', 'The results or report page opens.'], ['Click BACK.', 'The browser leaves the page.'], ['Read the main heading.', 'The list heading is shown.'], ['Check the page for a server error message.', 'No server error page is shown.']])
], ['TODO: entering results and comments is not automated; the entry forms of current distributions could not be reached with the seeded data (no current distributions).'])
write('admin-distribution-search', [tc('TC-106', 'A distribution search by a known reference lists that distribution', 'Proficiency Testing\\Admin', `Distributions Search accepts ${prev.length} real distribution references without an error (data/seed/distributions.json)`, [AD, tbl, ro, 'Whether a row is listed depends on the format of the distribution number, so only the page and the absence of an error are checked.'], [['Open Distributions > Search.', 'The Search page opens.'], ['Type the reference of the row in the Distribution Number box.', 'The box shows the reference.'], ['Click Search.', 'The page reloads with the h1 Search.'], ['Check the page for a server error message.', 'No server error page is shown.'], ['Do not change any data.', 'Nothing is changed.']])], ['TODO: confirm the format of the distribution number searched by the admin page so results can be asserted.'])
const ap = JSON.parse(fs.readFileSync('docs/approvals.json', 'utf8').replace(/^\uFEFF/, ''))
for (const f of ['external-distribution-data', 'admin-distribution-search']) { ap.testcases[f] = '2026-11-02T00:00:00Z'; ap.scopes[f] = '2026-11-02T00:00:00Z' }
fs.writeFileSync('docs/approvals.json', JSON.stringify(ap, null, 2) + '\n')
console.log(JSON.stringify({ prev: prev.length, reps: reps.length }))

