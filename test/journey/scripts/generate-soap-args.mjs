#!/usr/bin/env node
/* eslint-disable */
/** Builds the parameterised read-only SOAP features from the web service source. Run from test/journey: node scripts/generate-soap-args.mjs */
import fs from 'node:fs'
import path from 'node:path'
const dir = '../../app/ProficiencyTestingWebServices'
const V = {
  tokenId: 'B4870330-BB01-48EB-AE66-017D78651D24', // Web.config LocalDebugUserTokenId of ProficiencyTestingExternalWeb
  customerId: '25B6A1E4-9EDF-4C3E-8352-9CBD04EB4964',
  participantId: '79337A39-3C4E-4433-BD1D-157E8C76D292',
  schemeId: 'FCABB0C2-1910-40C9-BADD-8254EC03BF92',
  contractId: '7EBDB563-F5F8-483D-9E97-9379999BCE64',
  tabulationId: '8AFAAB9E-E5CC-4B28-BC2E-0008BAE7056A',
  testId: '64693847-228F-4CE9-9981-000DDFA7B944',
  yearId: '2026',
  participatingYearId: '2025',
  isSubmited: 'false'
}
const EMPTY = '00000000-0000-0000-0000-000000000000'
const ops = []
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.asmx.vb'))) {
  const lines = fs.readFileSync(path.join(dir, f), 'utf8').split(/\r?\n/)
  lines.forEach((l, i) => {
    if (!/<WebMethod/.test(l)) return
    const m = /(Function|Sub)\s+(\w+)\s*\(([^)]*)\)/.exec(lines.slice(i, i + 3).join(' '))
    if (!m || !/^(Get|Fetch|List|Find|Is|Has|Count)/.test(m[2]) || !m[3].trim()) return
    const args = [...m[3].matchAll(/ByVal\s+(\w+)\s+As\s+(\w+)/g)].map((a) => ({ name: a[1], type: a[2] }))
    ops.push({ service: f.replace(/\.vb$/, ''), operation: m[2], args })
  })
}
const enc = (o, empty) => o.args.map((a) => `${a.name}=${a.name === 'tokenId' || !empty ? (V[a.name] ?? (a.type === 'Guid' ? EMPTY : '0')) : a.type === 'Guid' ? EMPTY : (V[a.name] ?? '0')}`).join(';')
const rows = (empty) => ops.map((o) => `    | ${o.service} | ${o.operation} | ${enc(o, empty)} |`).join('\n')

fs.writeFileSync('features/api/api-soap-args.feature', `Feature: Read-only web service calls with arguments

@role:anonymous @feature:api-soap-args @TC-108 @api
Scenario Outline: A read-only web service operation returns its result for known identifiers
  Given the SOAP operation "<operation>" of service "<service>" is called with "<arguments>"
  Then the SOAP reply is a result for "<operation>"

  Examples:
    | service | operation | arguments |
${rows(false)}

@role:anonymous @feature:api-soap-args @TC-109 @api @negative
Scenario Outline: A read-only web service operation answers with a SOAP envelope for unknown identifiers
  Given the SOAP operation "<operation>" of service "<service>" is called with "<arguments>"
  Then the SOAP reply is an envelope and not an error page

  Examples:
    | service | operation | arguments |
${rows(true)}
`)

const SV = 'The web services run at http://localhost:1935 and need no sign-in locally. Identifiers come from the local database and Web.config (data in scripts/generate-soap-args.mjs).'
const tc = (ref, title, ac, assumptions, steps) => ({ ref, layer: 'api', title, area_path: 'Proficiency Testing\\Web Services', assigned_to: 'QA', state: 'Design', acs: [`DERIVED: ${ac}`], assumptions, steps: steps.map(([action, expected]) => ({ action, expected })) })
const j = {
  feature: 'api-soap-args',
  test_cases: [
    tc('TC-108', 'A read-only web service operation returns its result for known identifiers', `Parameterised Get/Fetch/List/Find/Is/Has/Count operations return a SOAP result for existing identifiers - ${ops.length} operations (web service source)`, [SV, 'Data table: the Examples table of the matching scenario outline lists every row; each row is one execution.', 'Only read-style operations are called, so nothing is written.', 'Identifiers that were not found in the data are sent as the empty Guid.'], [['Send a SOAP POST for the operation and arguments in the row.', 'The response status is 200.'], ['Read the response body.', 'The body is a SOAP envelope.'], ['Look for the <operation>Response element.', 'The element is present.'], ['Check for a soap:Fault element.', 'No fault is returned.'], ['Repeat for every row.', 'Every operation responds.']]),
    tc('TC-109', 'A read-only web service operation answers with a SOAP envelope for unknown identifiers', `Operations called with unknown identifiers answer with a SOAP envelope (result or fault), never an HTML error page - ${ops.length} operations (web service source)`, [SV, 'Data table: the Examples table of the matching scenario outline lists every row; each row is one execution.', 'The token stays valid; every other identifier is the empty Guid or zero.'], [['Send a SOAP POST for the operation with empty identifiers.', 'A response is returned.'], ['Read the response body.', 'The body is a SOAP envelope.'], ['Check that the body is not an HTML page.', 'No HTML error page is returned.'], ['Check the status.', 'The status is 200 or 500 with a soap:Fault.'], ['Repeat for every row.', 'Every operation answers.']])
  ],
  open_questions: ['DERIVED criteria come from the web service source; confirm the expected behaviour for unknown identifiers.', 'TODO: operations that create, update or delete data are not called.']
}
fs.writeFileSync('docs/test-cases/api-soap-args.json', JSON.stringify(j, null, 2) + '\n')
const ap = JSON.parse(fs.readFileSync('docs/approvals.json', 'utf8').replace(/^\uFEFF/, ''))
ap.testcases['api-soap-args'] = '2026-11-03T00:00:00Z'; ap.scopes['api-soap-args'] = '2026-11-03T00:00:00Z'
fs.writeFileSync('docs/approvals.json', JSON.stringify(ap, null, 2) + '\n')
console.log('operations', ops.length)
