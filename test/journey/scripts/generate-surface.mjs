#!/usr/bin/env node
/* eslint-disable */
/**
 * Builds the surveyed-surface features and their test cases from the survey data
 * (data/surface.json, data/surface2.json), so the coverage is reproducible and grounded in
 * what the running apps returned. Run from test/journey: node scripts/generate-surface.mjs
 */
import fs from 'node:fs'

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''))
const surface = read('data/surface.json')
const surface2 = read('data/surface2.json')
const slug = (rel) => rel.replace(/\.aspx$/i, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()
const UNSAFE = /logout|extendsession|^empty|^audit|^logs|documentdownload/i
const clean = (s) => (s ?? '').replace(/\s+/g, ' ').trim()

const pages = surface
  .filter((r) => r.status === 200 && !r.error && !UNSAFE.test(r.rel.split('/').pop()))
  .map((r) => ({ key: `${r.app}-${slug(r.rel)}`, app: r.app, rel: r.rel, route: '/' + r.rel, heading: clean(r.h1?.[0]) || null, title: clean(r.title) }))
fs.writeFileSync('data/pages.json', JSON.stringify(pages, null, 1))

const adminPages = pages.filter((p) => p.app === 'admin')
const externalPages = pages.filter((p) => p.app === 'external')
const table = (rows, cols) => rows.map((r) => `    | ${cols.map((c) => r[c]).join(' | ')} |`).join('\n')
const examples = (rows, cols) => `  Examples:\n    | ${cols.join(' | ')} |\n${table(rows, cols)}`

const feature = undefined
fs.mkdirSync('features/api', { recursive: true })
const pageExamples = (rows) => examples(rows.map((p) => ({ page: p.key })), ['page'])

const surfaceFeature = (app, list, role, startTc) => {
  const tag = (n, extra = '') => `@role:${role} @feature:surface-${app}-pages @TC-${String(startTc + n).padStart(3, '0')} @ui${extra}`
  const adm = app === 'admin' ? 'admin ' : ''
  return `${tag(0, ' @smoke')}
Scenario Outline: Every ${app} page loads with its expected heading
  Given the surveyed "<page>" page is opened
  Then the surveyed "<page>" page is shown
  And no ${adm}server error page is shown

${pageExamples(list)}

${tag(1)}
Scenario Outline: Every ${app} page keeps its heading after a reload
  Given the surveyed "<page>" page is opened
  When they reload the ${adm}page
  Then the surveyed "<page>" page is shown

${pageExamples(list)}

${tag(2)}
Scenario Outline: The Home breadcrumb link on every ${app} page returns to Home
  Given the surveyed "<page>" page is opened
  When they select the Home breadcrumb link
  Then the "home" ${adm}page is shown

${pageExamples(list.filter((p) => !/-home$/.test(p.key) && !/-default$/.test(p.key) && !/error/.test(p.key) && !/-scheme-admin-scheme$/.test(p.key)))}`
}

fs.writeFileSync('features/admin/surface-admin-pages.feature', `Feature: Surveyed admin pages\n\n${surfaceFeature('admin', adminPages, 'admin', 69)}\n`)
fs.writeFileSync('features/external/surface-external-pages.feature', `Feature: Surveyed external pages\n\n${surfaceFeature('external', externalPages, 'applicant', 72)}\n`)

// Form validation: one outline per form, one example per validator seen after an empty save.
const formKey = { 'Contracts Admin/Customer.aspx': 'customer', 'Scheme Admin/Scheme.aspx': 'scheme', 'Contracts Admin/GroupAddress.aspx': 'groupAddress' }
const validation = surface2.validation.map((v) => ({ form: formKey[v.rel], rel: v.rel, button: v.button, rows: v.visible }))
fs.writeFileSync('data/forms.json', JSON.stringify(validation, null, 1))
const formBody = validation.map((v, i) => `@role:admin @feature:admin-form-validation @TC-${String(75 + i).padStart(3, '0')} @ui @negative
Scenario Outline: Saving an empty ${v.form} form shows each required message
  Given an admin opens the "${v.form}" form
  When they save the empty form
  Then the validation message "<message>" is shown
  And no admin server error page is shown

  Examples:
    | message |
${v.rows.map((r) => `    | ${r.text} |`).join('\n')}
`).join('\n')
fs.writeFileSync('features/admin/admin-form-validation.feature', `Feature: Admin form validation\n\n${formBody}\n`)

// List drill-down.
const drill = surface2.drill.filter((d) => !d.error && !d.failed && d.h1?.length).map((d) => ({ list: slug(d.from), link: d.link, heading: d.h1[0], from: d.from }))
fs.writeFileSync('data/drill.json', JSON.stringify(drill, null, 1))
fs.writeFileSync('features/admin/admin-list-drilldown.feature', `Feature: Admin list drill-down

@role:admin @feature:admin-list-drilldown @TC-078 @ui
Scenario Outline: Following a list link opens the expected page
  Given the surveyed "admin-<list>" page is opened
  When they select the list link "<link>"
  Then the destination heading is "<heading>"
  And no admin server error page is shown

${examples(drill, ['list', 'link', 'heading'])}
`)

// Web services.
const services = surface2.services.filter((s) => s.status === 200 && s.xml).map((s) => ({ service: s.rel, ops: s.ops }))
fs.writeFileSync('data/services.json', JSON.stringify(services, null, 1))
const ops = services.flatMap((s) => s.ops.map((o) => ({ service: s.service, operation: o })))
fs.writeFileSync('features/api/api-web-services.feature', `Feature: Web services

@role:anonymous @feature:api-web-services @TC-079 @api
Scenario Outline: Every web service publishes a WSDL description
  Given the web service "<service>" description is requested
  Then the description is a WSDL document

${examples(services, ['service'])}

@role:anonymous @feature:api-web-services @TC-080 @api
Scenario Outline: Every web service description lists its operations
  Given the web service "<service>" description is requested
  Then the description lists the operation "<operation>"

${examples(ops, ['service', 'operation'])}
`)

// Test cases (one per outline) written as JSON for the ADO converter.
const ADMIN = 'http://localhost:1946'
const EXT = 'http://localhost:1688'
const tc = (ref, title, area, ac, assumptions, steps) => ({ ref, layer: ref >= 'TC-079' ? 'api' : 'ui', title, area_path: area, assigned_to: 'QA', state: 'Design', acs: [`DERIVED: ${ac}`], assumptions, steps: steps.map(([action, expected]) => ({ action, expected })) })
const common = ['Data table: the Examples table of the matching scenario outline lists every row; each row is one execution.', 'Read-only: nothing is created, saved or deleted, so no data cleanup is needed.']
const write = (feature, cases, extra = []) => fs.writeFileSync(`docs/test-cases/${feature}.json`, JSON.stringify({ feature, test_cases: cases, open_questions: ['DERIVED criteria come from a survey of the running apps and the page source; confirm the headings and messages are the intended behaviour.', ...extra] }, null, 2) + '\n')

const surfaceCases = (app, list, start, base, area) => [
  tc(`TC-${String(start).padStart(3, '0')}`, `Every ${app} page loads with its expected heading`, area, `Each surveyed ${app} page loads with the heading recorded by the survey - ${list.length} pages (data/pages.json)`, [`The ${app} site runs at ${base}. ${list.length} pages are listed in the Examples table.`, ...common], [[`Open ${base} followed by the route of the page in the current row.`, 'The page loads.'], ['Read the main heading.', 'The h1 matches the heading recorded for that page (or the title when the page has no h1).'], ['Check the page for a server error message.', 'No server error page is shown.'], ['Repeat for every row of the Examples table.', 'Every page loads.'], ['Look at the accessibility scan result for the page.', 'The page was scanned once and the result is in the accessibility report.']]),
  tc(`TC-${String(start + 1).padStart(3, '0')}`, `Every ${app} page keeps its heading after a reload`, area, `A reloaded ${app} page shows the same heading - ${list.length} pages (data/pages.json)`, common, [[`Open the page in the current row of ${base}.`, 'The page loads with its heading.'], ['Reload the page.', 'The page reloads.'], ['Read the main heading.', 'The heading is unchanged.'], ['Check for a server error message.', 'No server error page is shown.'], ['Repeat for every row.', 'Every page keeps its heading.']]),
  tc(`TC-${String(start + 2).padStart(3, '0')}`, `The Home breadcrumb link on every ${app} page returns to Home`, area, `Every ${app} page has a Home link that returns to the Home page (data/pages.json)`, common, [[`Open the page in the current row of ${base}.`, 'The page loads.'], ['Find the Home link in the breadcrumb or header.', 'The Home link is visible.'], ['Click the Home link.', 'The browser navigates to the Home page.'], ['Read the main heading.', `The h1 reads ${app === 'admin' ? 'Home' : 'VETQAS Proficiency Testing'}.`], ['Repeat for every row.', 'Every page links back to Home.']])
]
write('surface-admin-pages', surfaceCases('admin', adminPages, 69, ADMIN, 'Proficiency Testing\\Admin'))
write('surface-external-pages', surfaceCases('external', externalPages.filter(Boolean), 72, EXT, 'Proficiency Testing\\External Web'))
write('admin-form-validation', validation.map((v, i) => tc(`TC-${String(75 + i).padStart(3, '0')}`, `Saving an empty ${v.form} form shows each required message`, 'Proficiency Testing\\Admin', `Client validators on ${v.rel} block an empty save and show ${v.rows.length} message(s) (survey 2026-11-02)`, [`The ${v.form} form is ${v.rel} opened without parameters.`, `${v.rows.length} validation messages are expected, one per Examples row.`, 'The empty save is blocked by the client validators, so nothing is saved.'], [[`Open ${ADMIN}/${v.rel} as a signed-in Admin.`, 'The form loads with empty fields.'], ['Leave every field empty.', 'No value is entered.'], [`Click the Save button (${v.button}).`, 'The page stays on the form and nothing is saved.'], ['Read the validation messages.', 'Each message of the Examples table is shown.'], ['Check for a server error message.', 'No server error page is shown.']])))
write('admin-list-drilldown', [tc('TC-078', 'Following a list link opens the expected page', 'Proficiency Testing\\Admin', `List links open the pages recorded by the survey - ${drill.length} links (data/drill.json)`, common, [[`Open the list in the current row of ${ADMIN}.`, 'The list loads.'], ['Click the link named in the row.', 'A page opens.'], ['Read the main heading.', 'The h1 matches the heading in the row.'], ['Check for a server error message.', 'No server error page is shown.'], ['Return to the list.', 'The list is shown again.']])])
write('api-web-services', [
  tc('TC-079', 'Every web service publishes a WSDL description', 'Proficiency Testing\\Web Services', `Each .asmx service returns a WSDL document at ?WSDL - ${services.length} services (survey 2026-11-02)`, ['The web services run at http://localhost:1935 and need no sign-in locally.', ...common], [['Send GET to http://localhost:1935/<service>?WSDL for the service in the row.', 'The response status is 200.'], ['Read the response body.', 'The body is an XML document.'], ['Look for the wsdl:definitions element.', 'The element is present.'], ['Repeat for every row.', 'Every service publishes a description.'], ['Check the response for an error page.', 'No error page is returned.']]),
  tc('TC-080', 'Every web service description lists its operations', 'Proficiency Testing\\Web Services', `Each service description lists the operations recorded by the survey - ${ops.length} operations`, ['The web services run at http://localhost:1935 and need no sign-in locally.', ...common], [['Send GET to http://localhost:1935/<service>?WSDL for the service in the row.', 'The response status is 200.'], ['Read the wsdl:portType operations.', 'The operation list is present.'], ['Look for the operation named in the row.', 'The operation is listed.'], ['Repeat for every row.', 'Every operation is listed.'], ['Check the response for an error page.', 'No error page is returned.']])
])
console.log(JSON.stringify({ adminPages: adminPages.length, externalPages: externalPages.length, forms: validation.map((v) => v.rows.length), drill: drill.length, services: services.length, ops: ops.length }))
