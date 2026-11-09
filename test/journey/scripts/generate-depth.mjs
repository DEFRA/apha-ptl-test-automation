#!/usr/bin/env node
/* eslint-disable */
/**
 * Builds the detail-page, Cancel, pagination, year-selector and SOAP features from read-only surveys
 * (data/depth.json, data/depth2.json). Run from test/journey: node scripts/generate-depth.mjs
 */
import fs from 'node:fs'
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''))
const d = read('data/depth.json')
const d2 = read('data/depth2.json')
const rows = (list, cols) => list.map((r) => `    | ${cols.map((c) => r[c]).join(' | ')} |`).join('\n')

const structure = d.structure.filter((s) => !s.failed)
const buttons = structure.flatMap((s) => (s.buttons ?? []).map((b) => ({ path: s.chain, button: b })))
const labels = structure.flatMap((s) => [...new Set((s.labels ?? []).filter((l) => /:$/.test(l) && l.length < 40))].slice(0, 10).map((l) => ({ path: s.chain, label: l })))
const tabs = structure.flatMap((s) => (s.tabs ?? []).map((t) => ({ path: s.chain, tab: t })))
const cancels = d.cancel.map((c) => ({ path: c.chain, heading: c.h1 }))
const years = d2.years.filter((y) => !y.failed).map((y) => ({ path: y.chain, selector: y.selector, year: y.year, heading: y.h1 }))

fs.writeFileSync('features/admin/admin-detail-pages.feature', `Feature: Admin detail pages

@role:admin @feature:admin-detail-pages @TC-083 @ui
Scenario Outline: Detail pages show their action buttons
  Given an admin follows the click path "<path>"
  Then the page shows the button "<button>"

  Examples:
    | path | button |
${rows(buttons, ['path', 'button'])}

@role:admin @feature:admin-detail-pages @TC-084 @ui
Scenario Outline: Detail pages show their field labels
  Given an admin follows the click path "<path>"
  Then the page shows the label "<label>"

  Examples:
    | path | label |
${rows(labels, ['path', 'label'])}

@role:admin @feature:admin-detail-pages @TC-085 @ui
Scenario Outline: Scheme Details shows its tabs
  Given an admin follows the click path "<path>"
  Then the page shows the tab "<tab>"

  Examples:
    | path | tab |
${rows(tabs, ['path', 'tab'])}

@role:admin @feature:admin-detail-pages @TC-086 @ui
Scenario Outline: Cancel on a detail page returns to its list without saving
  Given an admin follows the click path "<path>"
  When they cancel the form
  Then the destination heading is "<heading>"
  And no admin server error page is shown

  Examples:
    | path | heading |
${rows(cancels, ['path', 'heading'])}
`)

fs.writeFileSync('features/admin/admin-lists-behaviour.feature', `Feature: Admin list behaviour

@role:admin @feature:admin-lists-behaviour @TC-087 @ui
Scenario: The Customers list moves to its next page
  Given an admin follows the click path "Manage Contracts > Customers"
  When they note the first row of the list
  And they select page "2" of the list
  Then the "customers" admin page is shown
  And the first row of the list has changed

@role:admin @feature:admin-lists-behaviour @TC-088 @ui
Scenario Outline: Selecting a year keeps the page and shows no error
  Given an admin follows the click path "<path>"
  When they select the year "<year>" in the "<selector>" dropdown
  Then the destination heading is "<heading>"
  And no admin server error page is shown

  Examples:
    | path | selector | year | heading |
${rows(years, ['path', 'selector', 'year', 'heading'])}

@role:admin @feature:admin-lists-behaviour @TC-089 @ui
Scenario: A customer search by a known QAL number lists that customer
  Given an admin follows the click path "Manage Contracts > Search"
  When they search "contracts" for "QAL/0344"
  Then the "contractsSearch" admin page is shown
  And the search results include "QAL/0344"
`)

const soap = d.soap.filter((s) => s.response && !s.fault)
fs.writeFileSync('features/api/api-soap-read.feature', `Feature: Read-only web service calls

@role:anonymous @feature:api-soap-read @TC-090 @api
Scenario Outline: A read-only web service operation returns its response
  Given the SOAP operation "<operation>" of service "<service>" is called
  Then the SOAP response contains the "<operation>" result

  Examples:
    | service | operation |
${rows(soap, ['service', 'operation'])}
`)

const AD = 'The admin site runs at http://localhost:1946 and the user is signed in as an Admin (Windows identity dt2\\ns000134).'
const tbl = 'Data table: the Examples table of the matching scenario outline lists every row; each row is one execution.'
const ro = 'Read-only: nothing is created, saved or deleted, so no data cleanup is needed.'
const tc = (ref, title, layer, area, ac, assumptions, steps) => ({ ref, layer, title, area_path: area, assigned_to: 'QA', state: 'Design', acs: [`DERIVED: ${ac}`], assumptions, steps: steps.map(([action, expected]) => ({ action, expected })) })
const ADM = 'Proficiency Testing\\Admin'
const write = (feature, cases, q) => fs.writeFileSync(`docs/test-cases/${feature}.json`, JSON.stringify({ feature, test_cases: cases, open_questions: ['DERIVED criteria come from read-only surveys of the running apps; confirm the labels and buttons are the intended behaviour.', ...q] }, null, 2) + '\n')
const nav = ['Open http://localhost:1946/home.aspx and click the links of the path in the current row.', 'The detail page opens with its heading.']
write('admin-detail-pages', [
  tc('TC-083', 'Detail pages show their action buttons', 'ui', ADM, `Customer, participant, contract, scheme and assessment pages show their buttons - ${buttons.length} buttons (data/depth.json)`, [AD, tbl, ro, 'Buttons are checked for presence only and are not clicked, except Cancel in TC-086.'], [nav, ['Look for the button named in the row.', 'The button is visible.'], ['Check the page for a server error message.', 'No server error page is shown.'], ['Repeat for every row.', 'Every button is shown.'], ['Do not click the button.', 'Nothing is changed.']]),
  tc('TC-084', 'Detail pages show their field labels', 'ui', ADM, `Detail pages show their field labels - ${labels.length} labels (data/depth.json)`, [AD, tbl, ro], [nav, ['Look for the field label named in the row.', 'The label is visible.'], ['Check the page for a server error message.', 'No server error page is shown.'], ['Repeat for every row.', 'Every label is shown.'], ['Do not change any field.', 'Nothing is changed.']]),
  tc('TC-085', 'Scheme Details shows its tabs', 'ui', ADM, `Scheme Details has the tabs ${tabs.map((t) => t.tab).join(', ')} (data/depth.json)`, [AD, tbl, ro, 'The content of each tab is not checked.'], [nav, ['Read the tab names.', 'The tab named in the row is shown.'], ['Check the page for a server error message.', 'No server error page is shown.'], ['Repeat for every row.', 'Every tab is shown.'], ['Do not change any field.', 'Nothing is changed.']]),
  tc('TC-086', 'Cancel on a detail page returns to its list without saving', 'ui', ADM, `Cancel on a detail page returns to the list it came from - ${cancels.length} pages (data/depth.json)`, [AD, tbl, 'No field is changed before Cancel, so nothing is saved.'], [nav, ['Click Cancel.', 'The browser leaves the form.'], ['Read the main heading of the page that opened.', 'The h1 matches the heading in the row.'], ['Check the page for a server error message.', 'No server error page is shown.'], ['Look at the list.', 'The list is shown unchanged.']])
], ['TODO: Cancel on a changed form may show a confirmation; the test does not change any field.'])
write('admin-lists-behaviour', [
  tc('TC-087', 'The Customers list moves to its next page', 'ui', ADM, 'The pager on Customers moves to the next page of customers (data/depth2.json)', [AD, ro], [['Open http://localhost:1946/home.aspx, click Manage Contracts then Customers.', 'The Customers list opens.'], ['Read the first row of the list.', 'A customer row is shown.'], ['Click page 2 in the pager.', 'The list reloads with the h1 Customers.'], ['Read the first row of the list again.', 'The first row differs from the one on page 1.'], ['Check the page for a server error message.', 'No server error page is shown.']]),
  tc('TC-088', 'Selecting a year keeps the page and shows no error', 'ui', ADM, `Year selectors on Weighted Pricing Plan, Postage Pricing Plan and Test Types reload the page - ${years.length} years (data/depth2.json)`, [AD, tbl, ro, 'The table contents for each year are not checked.'], [nav, ['Select the year named in the row from the year dropdown.', 'The page reloads.'], ['Read the main heading.', 'The h1 matches the heading in the row.'], ['Check the page for a server error message.', 'No server error page is shown.'], ['Do not change any price.', 'Nothing is changed.']]),
  tc('TC-089', 'A customer search by a known QAL number lists that customer', 'ui', ADM, 'Searching Manage Contracts > Search by QAL number QAL/0344 lists that customer (data/depth2.json)', [AD, ro, 'The seeded customer QAL/0344 exists in the local data.'], [['Open http://localhost:1946/home.aspx, click Manage Contracts then Search.', 'The Search page opens.'], ['Type QAL/0344 in the QAL Number box.', 'The box shows QAL/0344.'], ['Click Search.', 'The page reloads with the h1 Search.'], ['Read the results.', 'A row for QAL/0344 is listed.'], ['Check the page for a server error message.', 'No server error page is shown.']])
], ['TODO: the paging behaviour on other lists is not covered.'])
write('api-soap-read', [tc('TC-090', 'A read-only web service operation returns its response', 'api', 'Proficiency Testing\\Web Services', `Zero-argument read-only operations (Get, Fetch, List, Find, Is, Has, Count) return a SOAP response - ${soap.length} operation(s) (data/depth.json)`, ['The web services run at http://localhost:1935 and need no sign-in locally.', tbl, 'Only zero-argument operations whose names start with Get, Fetch, List, Find, Is, Has or Count are called, so nothing is written.', 'The response content is not checked beyond the response element.'], [['Send a SOAP POST for the operation in the row to the service in the row.', 'The response status is 200.'], ['Read the response body.', 'The body is a SOAP envelope.'], ['Look for the <operation>Response element.', 'The element is present.'], ['Check for a soap:Fault element.', 'No fault is returned.'], ['Repeat for every row.', 'Every operation responds.']])], ['TODO: operations with parameters are not called because valid inputs are unknown.'])
console.log(JSON.stringify({ buttons: buttons.length, labels: labels.length, tabs: tabs.length, cancels: cancels.length, years: years.length, soap: soap.length }))
