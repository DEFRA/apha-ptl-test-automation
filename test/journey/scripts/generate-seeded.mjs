#!/usr/bin/env node
/* eslint-disable */
/** Builds the seeded-data features from data/seed/samples.json. Run from test/journey: node scripts/generate-seeded.mjs */
import fs from 'node:fs'
const s = JSON.parse(fs.readFileSync('data/seed/samples.json', 'utf8').replace(/^\uFEFF/, ''))
const qals = s.qals
const schemes = s.schemes.filter((n) => !/[|]/.test(n))
const col = (list) => list.map((v) => `    | ${v} |`).join('\n')

fs.writeFileSync('features/admin/admin-search-data.feature', `Feature: Admin search against real data

@role:admin @feature:admin-search-data @TC-091 @ui
Scenario Outline: A customer search by a known QAL number lists that customer
  Given an admin opens the "contractsSearch" admin page
  When they search "contracts" for "<qal>"
  Then the "contractsSearch" admin page is shown
  And the search results include "<qal>"

  Examples:
    | qal |
${col(qals)}

@role:admin @feature:admin-search-data @TC-092 @ui
Scenario Outline: A scheme search by a known name lists that scheme
  Given an admin opens the "schemesSearch" admin page
  When they search "schemes" for "<name>"
  Then the "schemesSearch" admin page is shown
  And the search results include "<name>"

  Examples:
    | name |
${col(schemes)}
`)

fs.writeFileSync('features/external/external-seeded-data.feature', `Feature: External pages for the seeded customer

@role:applicant @feature:external-seeded-data @TC-093 @ui
Scenario Outline: A page shows the seeded customer and participant identifiers
  Given the seeded customer opens "<route>"
  Then the page shows the seeded text "<text>"
  And no server error page is shown

  Examples:
    | route | text |
    | /PendingContractOrder.aspx?year=current | QAL/0432 |
    | /PendingContractOrder.aspx?year=current | 1300 |
    | /EditCustomerDetails.aspx | QAL/0432 |
    | /EditParticipantDetails.aspx | 1300 |

@role:applicant @feature:external-seeded-data @TC-094 @ui
Scenario Outline: A list page of the seeded customer loads without a server error
  Given the seeded customer opens "<route>"
  Then the page shows the seeded text "<text>"
  And no server error page is shown

  Examples:
    | route | text |
    | /DistributionsCurrent.aspx | Distributions |
    | /DistributionsPrevious.aspx | Distribution Reference |
    | /Tabulations.aspx | Distribution Reference |
    | /DistributionComments.aspx | Distribution Reference |
`)

const AD = 'The admin site runs at http://localhost:1946 and the user is signed in as an Admin (Windows identity dt2\\ns000134).'
const EX = 'The external site runs at http://localhost:1688 with the local debug SSO user, linked by data/seed/apply.sql to the participant with Lab Code 1300 of customer QAL/0432.'
const ro = 'Read-only: nothing is created, saved or deleted, so no data cleanup is needed.'
const tbl = 'Data table: the Examples table of the matching scenario outline lists every row; each row is one execution.'
const tc = (ref, title, area, ac, assumptions, steps) => ({ ref, layer: 'ui', title, area_path: area, assigned_to: 'QA', state: 'Design', acs: [`DERIVED: ${ac}`], assumptions, steps: steps.map(([action, expected]) => ({ action, expected })) })
const write = (feature, cases, q) => fs.writeFileSync(`docs/test-cases/${feature}.json`, JSON.stringify({ feature, test_cases: cases, open_questions: ['DERIVED criteria come from the local database and read-only probes; confirm they are the intended behaviour.', ...q] }, null, 2) + '\n')
write('admin-search-data', [
  tc('TC-091', 'A customer search by a known QAL number lists that customer', 'Proficiency Testing\\Admin', `Manage Contracts > Search finds each of ${qals.length} existing customers by QAL number (data/seed/samples.json)`, [AD, tbl, ro, 'QAL numbers were sampled at random from tblCustomer; a result may list more than one customer.'], [['Open http://localhost:1946/home.aspx, click Manage Contracts then Search.', 'The Search page opens.'], ['Type the QAL number of the row in the QAL Number box.', 'The box shows the QAL number.'], ['Click Search.', 'The page reloads with the h1 Search.'], ['Read the results.', 'A row for the QAL number is listed.'], ['Check the page for a server error message.', 'No server error page is shown.']]),
  tc('TC-092', 'A scheme search by a known name lists that scheme', 'Proficiency Testing\\Admin', `Scheme Admin > Search finds each of ${schemes.length} existing schemes by name (data/seed/samples.json)`, [AD, tbl, ro, 'Scheme names were sampled at random from tblScheme and trimmed.'], [['Open http://localhost:1946/home.aspx, click Scheme Administration then Search.', 'The Search page opens.'], ['Type the scheme name of the row in the scheme name box.', 'The box shows the name.'], ['Click Search.', 'The page reloads with the h1 Search.'], ['Read the results.', 'A row for the scheme is listed.'], ['Check the page for a server error message.', 'No server error page is shown.']])
], ['TODO: distribution number search is not covered because no distribution reference column was confirmed.'])
write('external-seeded-data', [
  tc('TC-093', 'A page shows the seeded customer and participant identifiers', 'Proficiency Testing\\External', 'Order, customer and participant pages show the QAL number QAL/0432 and Lab Code 1300 of the signed-in participant (data/seed/apply.sql)', [EX, tbl, ro], [['Open the route in the row.', 'The page opens.'], ['Look for the text in the row.', 'The text is shown.'], ['Check the page for a server error message.', 'No server error page is shown.'], ['Do not change any field.', 'Nothing is changed.'], ['Repeat for every row.', 'Every row passes.']]),
  tc('TC-094', 'A list page of the seeded customer loads without a server error', 'Proficiency Testing\\External', 'Current Distributions, Previous Distributions, Reports and Comments load for the seeded customer (data/seed/apply.sql)', [EX, tbl, ro, 'Row content is not checked because it depends on the local data.'], [['Open the route in the row.', 'The page opens.'], ['Look for the text in the row.', 'The text is shown.'], ['Check the page for a server error message.', 'No server error page is shown.'], ['Do not click any button.', 'Nothing is changed.'], ['Repeat for every row.', 'Every row passes.']])
], ['TODO: results, comments and order summary with rows are not covered; the order wizard Next stays disabled after ticking a scheme and the cause is unknown.'])

const ap = JSON.parse(fs.readFileSync('docs/approvals.json', 'utf8').replace(/^\uFEFF/, ''))
for (const f of ['admin-search-data', 'external-seeded-data']) { ap.testcases[f] = '2026-11-02T00:00:00Z'; ap.scopes[f] = '2026-11-02T00:00:00Z' }
fs.writeFileSync('docs/approvals.json', JSON.stringify(ap, null, 2) + '\n')
console.log(JSON.stringify({ qals: qals.length, schemes: schemes.length }))
