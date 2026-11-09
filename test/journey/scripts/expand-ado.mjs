#!/usr/bin/env node
/* eslint-disable */
/**
 * Expands every Scenario Outline into one ADO test case per Examples row, so the ADO import set matches the automated test count.
 * Reads features/**.feature and docs/test-cases/<feature>.json (never edited). Writes docs/test-cases-ado/<feature>.json and .csv.
 * Run from test/journey: node scripts/expand-ado.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''))
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.feature') ? [path.join(d, e.name)] : []))
const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())

const byFeature = {}
for (const file of walk('features')) {
  let tags = []
  let ref = null
  let feature = null
  let header = null
  let inEx = false
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (t.startsWith('@')) { tags = t.split(/\s+/); continue }
    if (/^Scenario/.test(t)) {
      ref = tags.find((x) => /^@TC-\d+$/.test(x))?.slice(1)
      feature = tags.find((x) => x.startsWith('@feature:'))?.slice(9)
      if (!ref || !feature) { ref = null; continue }
      byFeature[feature] ??= {}
      byFeature[feature][ref] ??= { rows: [] }
      header = null; inEx = false; tags = []
      continue
    }
    if (/^Examples:/.test(t)) { inEx = true; header = null; continue }
    if (inEx && t.startsWith('|') && ref) {
      if (!header) header = cells(t)
      else byFeature[feature][ref].rows.push(Object.fromEntries(header.map((h, i) => [h, cells(t)[i] ?? ''])))
    }
  }
}

fs.mkdirSync('docs/test-cases-ado', { recursive: true })
let total = 0
for (const [feature, refs] of Object.entries(byFeature)) {
  const src = path.join('docs/test-cases', `${feature}.json`)
  if (!fs.existsSync(src)) continue
  const j = read(src)
  const out = []
  for (const tc of j.test_cases) {
    const rows = refs[tc.ref]?.rows ?? []
    if (rows.length === 0) { out.push(tc); continue }
    const num = tc.ref.replace('TC-', '')
    rows.forEach((row, i) => {
      const data = Object.entries(row).map(([k, v]) => `${k} = ${v}`).join('; ')
      const base = `${tc.ref}.${i + 1} ${tc.title}`
      const values = Object.values(row).join(' | ')
      const room = 120 - base.length - 3
      const title = room > 8 ? `${base} - ${values.slice(0, room)}` : `${base} - row ${i + 1}`.slice(0, 120)
      out.push({
        ...tc,
        ref: `TC-${num}${String(i + 1).padStart(3, '0')}`,
        title,
        assumptions: [...tc.assumptions.filter((a) => !a.startsWith('Data table:')), `Data row ${i + 1} of ${rows.length} of the outline ${tc.ref}.`],
        steps: [
          { action: `Use this data: ${data}.`, expected: 'The values are ready for the following steps.' },
          ...tc.steps.filter((s) => !/^Repeat for every row/.test(s.action)).map((s) => ({ action: s.action, expected: s.expected }))
        ]
      })
    })
  }
  total += out.length
  const dest = path.join('docs/test-cases-ado', `${feature}.json`)
  fs.writeFileSync(dest, JSON.stringify({ feature, test_cases: out, open_questions: j.open_questions }, null, 2) + '\n')
  const r = spawnSync('py', ['../../.github/skills/ado-testcase-csv/scripts/json_to_ado_csv.py', dest], { encoding: 'utf8' })
  const bad = (r.stdout + r.stderr).split('\n').filter((l) => /PROBLEM|WARNING/.test(l))
  if (bad.length) console.log(feature, bad.slice(0, 2).join(' / '))
}
console.log('ADO test cases (row level):', total)
