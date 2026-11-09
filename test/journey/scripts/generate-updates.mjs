/** Writes the test cases of the customer and participant update cycles. Run from test/journey: node scripts/generate-updates.mjs */
import fs from 'node:fs'
const EX = 'The external site runs at http://localhost:1688 with the local debug SSO user, linked by data/seed/apply.sql to the participant with Lab Code 1300 of customer QAL/0432. The admin site runs at http://localhost:1946 with Windows identity dt2\\ns000134.'
const CLEAN = 'Cleanup: the test declines any pending update of the seeded customer or participant in a separate admin browser, even when it fails, so the form is never left locked.'
const tc = (ref, title, ac, assumptions, steps) => ({ ref, layer: 'ui', title, area_path: 'Proficiency Testing\\External', assigned_to: 'QA', state: 'Design', acs: [`DERIVED: ${ac}`], assumptions, steps: steps.map(([action, expected]) => ({ action, expected })) })
const write = (feature, cases, q) => fs.writeFileSync(`docs/test-cases/${feature}.json`, JSON.stringify({ feature, test_cases: cases, open_questions: ['DERIVED criteria come from the source code and local probes; confirm they are the intended behaviour.', ...q] }, null, 2) + '\n')
const make = (who, whoCap, ref0, listRoute, detailPage, declined, approvedMsg, label) => [
  tc(`TC-${String(ref0).padStart(3, '0')}`, `Submitting a changed ${who} contact name locks the form`, `After UPDATE DETAILS with a changed contact name the ${who} details form is locked until an admin reviews it (EditCustomerDetails/EditParticipantDetails.aspx.vb DisableForm)`, [EX, CLEAN, 'Creates a pending update; it is declined by the cleanup.'], [
    [`Make sure no pending ${who} update exists, then open the ${who} details page.`, `The ${who} details form is editable.`],
    ['Type a unique value in Contact Name and tab out of the box.', 'UPDATE DETAILS becomes enabled.'],
    ['Click UPDATE DETAILS.', 'The page reloads.'],
    ['Look at the form fields.', 'Contact Name and the other fields are disabled.'],
    ['Look at UPDATE DETAILS.', 'The button is disabled.']]),
  tc(`TC-${String(ref0 + 1).padStart(3, '0')}`, `An admin declines a pending ${who} update and the ${who} can edit again`, `Decline on ${detailPage} discards the pending update and unlocks the ${who} form (${declined})`, [EX, CLEAN, 'Creates a pending update and declines it.'], [
    [`Submit a changed Contact Name as the ${who}.`, 'The form is locked.'],
    [`As admin open ${listRoute} and find the ${label} row.`, 'The pending update is listed.'],
    ['Click Details, then Decline.', `A message "${declined}" is shown and the list reopens.`],
    [`As the ${who} open the details page again.`, 'The form is editable.'],
    ['Read Contact Name.', 'It shows the original value, not the submitted one.']]),
  tc(`TC-${String(ref0 + 2).padStart(3, '0')}`, `An admin approves a pending ${who} update that changes nothing`, `Approve on ${detailPage} applies the pending update and unlocks the ${who} form (${approvedMsg})`, [EX, CLEAN, 'The submitted values equal the current values, so approving leaves the data unchanged.'], [
    [`Submit the unchanged Contact Name as the ${who} (focus out enables the button).`, 'The form is locked.'],
    [`As admin open ${listRoute} and find the ${label} row.`, 'The pending update is listed.'],
    ['Click Details, then Approve.', 'The update is applied and the list reopens.'],
    [`As the ${who} open the details page again.`, 'The form is editable.'],
    ['Read Contact Name.', 'It still shows the original value.']])
]
write('customer-update', make('customer', 'Customer', 95, '/Contracts Admin/ReviewPendingCustomerUpdates.aspx', 'PendingCustomerUpdateDetails.aspx', 'Customer updates declined successfully', 'ButtonApprove_Click', 'QAL/0432'), ['TODO: Approve with changed values is not automated because it would alter customer data.'])
write('participant-update', make('participant', 'Participant', 98, '/Contracts Admin/ReviewPendingParticipantUpdates.aspx', 'PendingParticipantUpdateDetails.aspx', 'Participant updates declined successfully', 'Participant details updated successfully', 'Lab Code 1300'), ['TODO: Approve with changed values is not automated because it would alter participant data.'])
const ap = JSON.parse(fs.readFileSync('docs/approvals.json', 'utf8').replace(/^\uFEFF/, ''))
for (const f of ['customer-update', 'participant-update']) { ap.testcases[f] = '2026-11-02T00:00:00Z'; ap.scopes[f] = '2026-11-02T00:00:00Z' }
fs.writeFileSync('docs/approvals.json', JSON.stringify(ap, null, 2) + '\n')

