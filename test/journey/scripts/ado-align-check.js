/**
 * Checks that the row-level ADO set matches the automated tests, per TC ref.
 * Run from test/journey after the suite run has finished: node scripts/ado-align-check.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))

const ado = {}
for (const f of walk('docs/test-cases-ado').filter((x) => x.endsWith('.json'))) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''))
  for (const t of j.test_cases) {
    const ref = /^(TC-\d{3})/.exec(t.title)?.[1] ?? t.ref
    ado[ref] = (ado[ref] ?? 0) + 1
  }
}

const listing = execSync('npx playwright test --list --reporter=json', { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
const auto = {}
const walkSuite = (s) => {
  for (const child of s.suites ?? []) walkSuite(child)
  for (const spec of s.specs ?? []) {
    const ref = (spec.tags ?? []).map((t) => /^@?(TC-\d{3})$/.exec(t)?.[1]).find(Boolean)
    if (ref) auto[ref] = (auto[ref] ?? 0) + 1
  }
}
for (const s of JSON.parse(listing.slice(listing.indexOf('{'))).suites ?? []) walkSuite(s) // Playwright may print "Listing tests:" first

// Scenarios tagged @manual are kept as ADO test cases only and never run, so count their rows here.
import { readdirSync, readFileSync as readText, statSync } from 'node:fs'
import { join } from 'node:path'
const featureFiles = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? featureFiles(join(dir, n)) : n.endsWith('.feature') ? [join(dir, n)] : []))
for (const file of featureFiles('features')) {
  const lines = readText(file, 'utf8').split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    if (!/(^|\s)@manual\b/.test(lines[i])) continue
    const ref = /@(TC-\d{3})/.exec(lines[i])?.[1]
    let j = i + 1
    while (j < lines.length && !/^\s*(Scenario|Scenario Outline):/.test(lines[j])) j++
    const outline = /Scenario Outline:/.test(lines[j] ?? '')
    let rows = 1
    if (outline) {
      rows = 0
      let header = true
      for (let k = j + 1; k < lines.length && !/^\s*(@|Scenario)/.test(lines[k]); k++) {
        if (/^\s*Examples:/.test(lines[k])) header = true
        else if (/^\s*\|/.test(lines[k])) { if (header) header = false; else rows++ }
      }
    }
    if (ref) auto[ref] = (auto[ref] ?? 0) + rows
  }
}
const refs = [...new Set([...Object.keys(ado), ...Object.keys(auto)])].sort()
const problems = refs.filter((r) => (ado[r] ?? 0) !== (auto[r] ?? 0))
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0)
console.log(`ADO row-level cases: ${sum(ado)}; automated feature tests: ${sum(auto)}; test case refs: ${refs.length}`)
for (const r of problems) console.log(`MISMATCH ${r}: ADO ${ado[r] ?? 0}, automated ${auto[r] ?? 0}`)
console.log(problems.length === 0 ? 'ALIGNED: every TC ref has the same number of ADO cases and automated tests.' : `${problems.length} mismatch(es).`)
process.exit(problems.length === 0 ? 0 : 1)


