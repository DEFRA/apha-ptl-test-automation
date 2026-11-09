#!/usr/bin/env node
/**
 * Link the approved ADO test cases to the automated scenarios, so requirement-based suites
 * can show automation coverage instead of only local @TC tags.
 *
 * Run from test/journey after a run:
 *   node scripts/automation-map.js                       build docs/test-cases/automation-map.json
 *   node scripts/automation-map.js --junit <path>        use a specific JUnit XML
 *   node scripts/automation-map.js --push                also set the ADO automation fields
 *
 * `--push` needs: ADO_ORG_URL, ADO_PROJECT, ADO_PAT and docs/test-cases/ado-ids.json
 * ({"TC-001": 12345, ...}). It writes AutomationStatus, AutomatedTestName,
 * AutomatedTestStorage and AutomatedTestType on each work item. ADO assigns its own ids on
 * CSV import, so record them in ado-ids.json once after the first import.
 *
 * Not exercised against a real ADO organisation by this pack; run --push on one work item
 * first and check the Associated Automation tab before trusting it in a pipeline.
 */
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const flagValue = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}
const JUNIT = flagValue('--junit', path.join('reports', 'junit', 'results.xml'))
const OUT = flagValue('--out', path.join('docs', 'test-cases', 'automation-map.json'))
const IDS = flagValue('--ids', path.join('docs', 'test-cases', 'ado-ids.json'))
const PUSH = args.includes('--push')

const visible = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const walk = (dir, ext) => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith(ext)).map((f) => path.join(dir, String(f)))
  : [])
const stem = (file) => path.basename(file).replace(/\.[^.]+$/, '')

/* ------------------------------------------------------------- test cases and scenarios */

const testCases = walk(path.join('docs', 'test-cases'), '.json')
  .filter((file) => !file.endsWith('automation-map.json') && !file.endsWith('ado-ids.json'))
  .flatMap((file) => {
    const feature = stem(file)
    return (JSON.parse(fs.readFileSync(file, 'utf8')).test_cases ?? []).map((tc) => ({
      ref: tc.ref,
      title: visible(tc.title),
      feature,
      scenario: null,
      junit: null,
      adoId: null
    }))
  })

for (const file of walk('features', '.feature')) {
  let tags = []
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const text = line.trim()
    if (text.startsWith('@')) tags.push(...text.split(/\s+/))
    else if (/^Scenario( Outline)?:/.test(text)) {
      const title = visible(text.replace(/^Scenario( Outline)?:\s*/, ''))
      for (const tag of tags.filter((t) => /^@TC-\d+$/.test(t))) {
        const tc = testCases.find((c) => c.ref === tag.slice(1))
        if (tc) tc.scenario = title
      }
      tags = []
    } else if (text && !text.startsWith('#')) tags = []
  }
}

/* ------------------------------------------------------------------------ JUnit results */

const junitCases = []
if (fs.existsSync(JUNIT)) {
  for (const match of fs.readFileSync(JUNIT, 'utf8').matchAll(/<testcase\b([^>]*?)\/?>/g)) {
    const attrs = {}
    for (const attr of match[1].matchAll(/(\w+)="([^"]*)"/g)) attrs[attr[1]] = attr[2]
    if (attrs.name) junitCases.push({ name: visible(attrs.name), classname: attrs.classname ?? '', file: attrs.file ?? '' })
  }
}

/** Scenario Outlines interpolate their examples in JUnit, so compare up to the first placeholder. */
const scenarioMatches = (junitName, scenarioTitle) => {
  const name = visible(junitName)
  const title = visible(scenarioTitle)
  if (!title.includes('<')) return name === title
  return name.startsWith(title.slice(0, title.indexOf('<')).trim())
}

const matched = new Set()
for (const tc of testCases) {
  if (!tc.scenario) continue
  const hit = junitCases.find((j) => scenarioMatches(j.name, tc.scenario))
  if (hit) {
    tc.junit = { name: hit.name, classname: hit.classname, file: hit.file }
    matched.add(hit)
  }
}

const map = {
  generatedAt: new Date().toISOString(),
  junit: fs.existsSync(JUNIT) ? JUNIT : null,
  totals: {
    testCases: testCases.length,
    withScenario: testCases.filter((t) => t.scenario).length,
    withJunit: testCases.filter((t) => t.junit).length,
    junitCases: junitCases.length
  },
  testCases,
  unmatchedJunit: junitCases.filter((j) => !matched.has(j)).map((j) => j.name)
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, `${JSON.stringify(map, null, 2)}\n`)
console.log(`automation map: ${map.totals.withJunit}/${map.totals.testCases} test case(s) linked to a JUnit result -> ${OUT}`)
if (!junitCases.length) console.log(`NOTE: no JUnit results at ${JUNIT}. Run the tests with the junit reporter to link results.`)
for (const tc of testCases.filter((t) => !t.scenario)) console.log(`PROBLEM: ${tc.ref} has no scenario tagged @${tc.ref}`)
for (const name of map.unmatchedJunit) console.log(`NOTE: JUnit result has no @TC tag: ${name}`)

/* -------------------------------------------------------------------------------- push */

if (PUSH) {
  const org = process.env.ADO_ORG_URL
  const project = process.env.ADO_PROJECT
  const pat = process.env.ADO_PAT
  if (!org || !project || !pat) {
    console.error('ADO_ORG_URL, ADO_PROJECT and ADO_PAT are required for --push.')
    process.exit(2)
  }
  if (!fs.existsSync(IDS)) {
    console.error(`${IDS} is missing. Export the ADO work item ids for each ref before pushing.`)
    process.exit(2)
  }
  const ids = JSON.parse(fs.readFileSync(IDS, 'utf8'))
  const auth = `Basic ${Buffer.from(`:${pat}`).toString('base64')}`
  let pushed = 0
  for (const tc of testCases) {
    const id = ids[tc.ref]
    if (!id || !tc.junit) continue
    const body = [
      { op: 'add', path: '/fields/Microsoft.VSTS.TCM.AutomationStatus', value: 'Automated' },
      { op: 'add', path: '/fields/Microsoft.VSTS.TCM.AutomatedTestName', value: tc.junit.name },
      { op: 'add', path: '/fields/Microsoft.VSTS.TCM.AutomatedTestStorage', value: tc.junit.classname || tc.feature },
      { op: 'add', path: '/fields/Microsoft.VSTS.TCM.AutomatedTestType', value: 'Playwright' }
    ]
    const response = await fetch(`${org.replace(/\/$/, '')}/${encodeURIComponent(project)}/_apis/wit/workitems/${id}?api-version=7.1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json-patch+json', Authorization: auth },
      body: JSON.stringify(body)
    })
    if (!response.ok) console.error(`PROBLEM: ${tc.ref} (work item ${id}) -> HTTP ${response.status} ${await response.text()}`)
    else pushed += 1
  }
  console.log(`Pushed automation fields for ${pushed} work item(s).`)
}
