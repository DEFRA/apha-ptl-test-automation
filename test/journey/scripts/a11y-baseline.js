#!/usr/bin/env node
/**
 * Accessibility baseline for the pre-migration UI. In `legacy` the suite reports every
 * violation but fails only on ones that are not in this file, so a pull request cannot add
 * a new accessibility defect while the existing backlog stays visible.
 *
 * Run from test/journey after a test run:
 *   node scripts/a11y-baseline.js            show current violations vs the stored baseline
 *   node scripts/a11y-baseline.js --update   rewrite the active profile's bucket (review the diff)
 *
 * Shape: { "generatedAt": "...", "legacy": ["/route|rule|target", ...], "gds": [...] }
 */
import fs from 'node:fs'
import path from 'node:path'
import { PROFILE } from '../support/profiles.js'
import { violationKey } from '../support/page-key.js'

const DIR = path.resolve(process.env.A11Y_DIR ?? 'reports/a11y')
const FILE = path.resolve(process.env.A11Y_BASELINE ?? 'docs/a11y-baseline.json')
const UPDATE = process.argv.includes('--update')

const readResults = () => {
  const dir = path.join(DIR, 'results')
  return fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
    : []
}

if (!fs.existsSync(path.join(DIR, 'results'))) {
  console.error(`No scan results in ${path.join(DIR, 'results')}. Run the tests with A11Y_SCAN enabled first.`)
  process.exit(2)
}

const current = new Set()
for (const page of readResults()) {
  for (const violation of page.violations ?? []) current.add(violationKey(page.route, violation))
}

const existing = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {}
const stored = new Set(existing[PROFILE] ?? [])
const added = [...current].filter((k) => !stored.has(k)).sort()
const fixed = [...stored].filter((k) => !current.has(k)).sort()

if (UPDATE) {
  const next = { ...existing, generatedAt: new Date().toISOString(), [PROFILE]: [...current].sort() }
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  fs.writeFileSync(FILE, `${JSON.stringify(next, null, 2)}\n`)
  console.log(`Baseline for UI_PROFILE=${PROFILE} written: ${current.size} violation(s) in ${FILE}`)
  for (const k of added) console.log(`  ADDED   ${k}`)
  for (const k of fixed) console.log(`  REMOVED ${k}`)
  process.exit(0)
}

console.log(`a11y baseline (UI_PROFILE=${PROFILE})`)
console.log(`  stored:  ${stored.size}`)
console.log(`  current: ${current.size}`)
console.log(`  new:     ${added.length}`)
console.log(`  fixed:   ${fixed.length}`)
for (const k of added) console.log(`  NOT IN BASELINE ${k}`)
for (const k of fixed) console.log(`  FIXED (remove from baseline) ${k}`)
process.exit(0)
