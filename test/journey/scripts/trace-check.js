#!/usr/bin/env node
/**
 * Traceability and approval gate. Run from test/journey.
 *
 * Checks, in order:
 *   1. every docs/test-cases/<f>.json has an up-to-date <f>.csv (byte comparison, via the converter)
 *   2. every <f>.json has a feature file named <f>.feature, and the reverse
 *   3. every test case is covered by a scenario, titles match, one feature file per file
 *   4. every feature has a recorded TESTCASES APPROVED entry in docs/approvals.json
 *
 * Flags:
 *   --allow-missing  ignore test cases and feature files that do not exist yet, and skip the
 *                    approval check (build in progress, before the user approves)
 *   --next           print the next free TC reference and exit
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const allowMissing = process.argv.includes('--allow-missing')
const printNext = process.argv.includes('--next')
// `_example` holds the scaffold's own worked example. It is generated so it can be proved
// runnable, and it is excluded from the traceability and approval gates.
const isExample = (file) => file.replace(/\\/g, '/').includes('/_example/')
const walk = (dir, ext) => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { recursive: true })
    .filter((f) => String(f).endsWith(ext))
    .map((f) => path.join(dir, String(f)))
    .filter((f) => !isExample(f))
  : [])
const stem = (file) => path.basename(file).replace(/\.[^.]+$/, '')
const read = (file) => fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
const visible = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const caseFiles = walk('docs/test-cases', '.json')
const cases = caseFiles.flatMap((file) =>
  (JSON.parse(read(file)).test_cases ?? []).map((tc) => ({ ref: tc.ref, title: tc.title, file })))

if (printNext) {
  const max = Math.max(0, ...cases.map((c) => Number(/^TC-(\d+)$/.exec(c.ref ?? '')?.[1] ?? 0)))
  console.log(`TC-${String(max + 1).padStart(3, '0')}`)
  process.exit(0)
}

const featureFiles = walk('features', '.feature')
const scenarios = []
for (const file of featureFiles) {
  let tags = []
  for (const line of read(file).split(/\r?\n/)) {
    const text = line.trim()
    if (text.startsWith('@')) tags.push(...text.split(/\s+/))
    else if (/^Scenario( Outline)?:/.test(text)) {
      scenarios.push({ title: text.replace(/^Scenario( Outline)?:\s*/, ''), refs: tags.filter((t) => /^@TC-\d+$/.test(t)).map((t) => t.slice(1)), file })
      tags = []
    } else if (text && !text.startsWith('#')) tags = []
  }
}

const problems = []

/* ------------------------------------------------------------------ 1. CSV freshness */

const converter = process.env.ADO_CSV_CONVERTER
  ?? ['../../.github/skills/ado-testcase-csv/scripts/json_to_ado_csv.py', '.github/skills/ado-testcase-csv/scripts/json_to_ado_csv.py']
    .find((candidate) => fs.existsSync(candidate))

const python = [process.env.PYTHON, 'python3', 'python', 'py']
  .filter(Boolean)
  .find((bin) => spawnSync(bin, ['--version'], { encoding: 'utf8' }).status === 0)

if (!python) {
  problems.push('Python 3 not found. The CSV cannot be verified; install Python 3 or set PYTHON.')
}
if (!converter) {
  problems.push('json_to_ado_csv.py not found. Install the pack with install.sh, or set ADO_CSV_CONVERTER.')
}

let csvsChecked = 0
for (const file of caseFiles) {
  const csvFile = file.replace(/\.json$/, '.csv')
  const expected = JSON.parse(read(file)).test_cases ?? []
  if (!fs.existsSync(csvFile)) {
    problems.push(`No CSV for ${file}. Run json_to_ado_csv.py`)
    continue
  }
  // Cheap sanity check that works without Python.
  const rows = (read(csvFile).match(/^,Test Case,/gm) ?? []).length
  if (rows !== expected.length) {
    problems.push(`${csvFile} has ${rows} test cases but ${file} has ${expected.length}. Rerun the converter`)
    continue
  }
  if (!python || !converter) continue
  // Full check: the converter re-renders and compares byte for byte, so step text drift is caught.
  const result = spawnSync(python, [converter, file, '--check'], { encoding: 'utf8' })
  csvsChecked += 1
  if (result.status === 2) {
    problems.push(`${file} is not valid input for the converter: ${(result.stdout ?? '').trim()}`)
  } else if (result.status === 1) {
    const detail = (result.stdout ?? '').split('\n').filter((line) => /^WARNING:/.test(line)).join(' ')
    problems.push(`${file} failed the converter check. ${detail}`.trim())
  } else if (result.status !== 0) {
    problems.push(`The converter crashed on ${file} (exit ${result.status}): ${(result.stderr ?? '').trim()}`)
  }
}

/* ------------------------------------------------------- 2. one feature file per case file */

const caseStems = new Set(caseFiles.map(stem))
const featureStems = new Set(featureFiles.map(stem))
for (const s of caseStems) if (!allowMissing && !featureStems.has(s)) problems.push(`No feature file named ${s}.feature for docs/test-cases/${s}.json`)
for (const s of featureStems) if (!caseStems.has(s)) problems.push(`Feature file ${s}.feature has no docs/test-cases/${s}.json`)

/* ---------------------------------------------------------------- 3. scenario traceability */

const refs = new Map()
for (const c of cases) {
  if (!c.ref) problems.push(`Test case has no ref: "${c.title}" (${c.file})`)
  else if (refs.has(c.ref)) problems.push(`Duplicate ref ${c.ref}`)
  else refs.set(c.ref, c)
}
const covered = new Set(scenarios.flatMap((s) => s.refs))
if (!allowMissing) for (const [ref, c] of refs) if (!covered.has(ref)) problems.push(`No scenario for ${ref}: "${c.title}"`)
for (const s of scenarios) {
  if (!s.refs.length) problems.push(`Scenario without @TC tag: "${s.title}" (${s.file})`)
  for (const ref of s.refs) {
    const c = refs.get(ref)
    if (!c) problems.push(`Unknown ${ref} on "${s.title}"`)
    else {
      if (visible(s.title) !== visible(c.title)) problems.push(`Title differs for ${ref}: "${s.title}" vs "${c.title}"`)
      if (stem(s.file) !== stem(c.file)) problems.push(`${ref} is in ${stem(s.file)}.feature but its test case is in ${stem(c.file)}.json`)
    }
  }
}

/* -------------------------------------------------------------------- 4. approvals ledger */

const APPROVALS = path.join('docs', 'approvals.json')
let approvals = null
if (fs.existsSync(APPROVALS)) {
  try {
    approvals = JSON.parse(read(APPROVALS))
  } catch (error) {
    problems.push(`${APPROVALS} is not valid JSON: ${error.message}`)
  }
}

if (!allowMissing) {
  if (!approvals) {
    problems.push(`${APPROVALS} is missing. The architect records APPROVED and TESTCASES APPROVED there; see the architect Prerequisites.`)
  } else {
    if (!approvals.approvedAt) problems.push(`${APPROVALS} has no approvedAt: the plan was never approved.`)
    for (const s of caseStems) {
      if (featureStems.has(s) && !approvals.testcases?.[s]) {
        problems.push(`No TESTCASES APPROVED entry for "${s}" in ${APPROVALS}.`)
      }
    }
    for (const key of Object.keys(approvals.testcases ?? {})) {
      if (!caseStems.has(key)) problems.push(`${APPROVALS} approves "${key}" but there is no docs/test-cases/${key}.json`)
    }
  }
}

console.log(`${refs.size} test cases, ${scenarios.length} scenarios, ${caseFiles.length} CSV files (${csvsChecked} byte-checked), ${problems.length} problems`)
for (const p of problems) console.log('PROBLEM:', p)
process.exit(problems.length ? 1 : 0)
