#!/usr/bin/env node
/* eslint-disable */
/**
 * Builds the click-path and per-field validation features from data/drill-chains.json and
 * data/field-validation.json (read-only surveys of the running admin app).
 * Run from test/journey: node scripts/generate-flows.mjs
 */
import fs from 'node:fs'
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''))
const chains = read('data/drill-chains.json').filter((c) => c.hasQuery && c.h1?.length && !c.error)
const fields = read('data/field-validation.json')
const rows = (list, cols) => list.map((r) => `    | ${cols.map((c) => r[c]).join(' | ')} |`).join('\n')

const paths = chains.map((c) => ({ path: c.chain.join(' > '), heading: c.h1[0] }))
fs.writeFileSync('features/admin/admin-click-paths.feature', `Feature: Admin click paths to parameterised pages

@role:admin @feature:admin-click-paths @TC-081 @ui
Scenario Outline: Following the menu and list links reaches the page that needs an id
  Given an admin follows the click path "<path>"
  Then the destination heading is "<heading>"
  And no admin server error page is shown

  Examples:
    | path | heading |
${rows(paths, ['path', 'heading'])}
`)
const f = fields.map((x) => ({ path: x.chain, field: x.field, message: x.message }))
fs.writeFileSync('features/admin/admin-field-validation.feature', `Feature: Admin field validation on existing records

@role:admin @feature:admin-field-validation @TC-082 @ui @negative
Scenario Outline: Clearing a required field on an existing record blocks the save and shows its message
  Given an admin follows the click path "<path>"
  When they clear the "<field>" field and save
  Then the validation message "<message>" is shown
  And no admin server error page is shown

  Examples:
    | path | field | message |
${rows(f, ['path', 'field', 'message'])}
`)

const tc = (ref, title, ac, assumptions, steps) => ({ ref, layer: 'ui', title, area_path: 'Proficiency Testing\\Admin', assigned_to: 'QA', state: 'Design', acs: [`DERIVED: ${ac}`], assumptions: ['The admin site runs at http://localhost:1946 and the user is signed in as an Admin (Windows identity dt2\\ns000134).', 'Data table: the Examples table of the matching scenario outline lists every row; each row is one execution.', ...assumptions], steps: steps.map(([action, expected]) => ({ action, expected })) })
const write = (feature, cases, q) => fs.writeFileSync(`docs/test-cases/${feature}.json`, JSON.stringify({ feature, test_cases: cases, open_questions: ['DERIVED criteria come from read-only surveys of the running app and the page source; confirm the headings and messages are the intended behaviour.', ...q] }, null, 2) + '\n')
write('admin-click-paths', [tc('TC-081', 'Following the menu and list links reaches the page that needs an id', `Pages that need a record id (customer, participant, contract, scheme, assessment items) are reached by clicking from the menu and lists - ${paths.length} paths (data/drill-chains.json)`, ['Read-only: only view links are followed (Details, Participants, Contracts, View, Viewers).', 'Opening these pages directly without an id is expected to fail (for example PendingCustomerUpdateDetails.aspx throws "CustomerId is required as querystring parameter"), so they are only tested through navigation.'], [['Open http://localhost:1946/home.aspx.', 'The Home page loads.'], ['Click the links of the path in the current row, in order.', 'Each click opens the next page.'], ['Read the main heading of the destination page.', 'The h1 matches the heading in the row.'], ['Check the page for a server error message.', 'No server error page is shown.'], ['Repeat for every row.', 'Every path reaches its page.']])], ['TODO: the paths to Contract Items, Pending Customer Update Details and Pending Participant Update Details need a seeded pending record or a contract with items.'])
write('admin-field-validation', [tc('TC-082', 'Clearing a required field on an existing record blocks the save and shows its message', `Client validators block saving when a required field is cleared on existing records - ${f.length} fields (data/field-validation.json, survey 2026-11-02)`, ['The record is the first one in its list. Only one field is cleared per execution and the page is left without a successful save.', 'The Lab Code field on Participant Details posts back when cleared and is not covered.'], [['Follow the click path in the current row to the record.', 'The record form opens with its values.'], ['Clear the field named in the row.', 'The field is empty.'], ['Click Save.', 'The page stays on the form and nothing is saved.'], ['Read the validation messages.', 'The message in the row is shown.'], ['Check the page for a server error message.', 'No server error page is shown.']])], ['TODO: confirm the server also rejects a blank value if the client validators are bypassed.'])
console.log(JSON.stringify({ paths: paths.length, fields: f.length }))
