#!/usr/bin/env node
/**
 * Accessibility coverage gate. Every route in the inventory for the active UI profile must
 * be one of: analysed by axe, covered by a scanned template, or explicitly waived with a
 * reason. Anything else is a page nobody has looked at, which is how audits fail late.
 *
 * Run from test/journey after the test run:
 *   npm run a11y:coverage
 *   node scripts/a11y-coverage.js --json
 *
 * Waivers live in docs/a11y-waivers.json:
 *   [{ "route": "/apply/start", "reason": "static content, covered by manual audit", "expires": "2026-12-31" }]
 */
import fs from 'node:fs'
import path from 'node:path'
import { PROFILE } from '../support/profiles.js'
import { normaliseRoute } from '../support/page-key.js'

const DIR = path.resolve(process.env.A11Y_DIR ?? 'reports/a11y')
const INVENTORY = 'data/page-inventory.json'
const WAIVERS = 'docs/a11y-waivers.json'
const JSON_OUT = process.argv.includes('--json')

const readAll = (folder) => {
  const dir = path.join(DIR, folder)
  return fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
    : []
}

const problems = []

if (!fs.existsSync(DIR)) {
  problems.push(`No accessibility results in ${DIR}. Run the tests with A11Y_SCAN enabled first.`)
}

const inventory = fs.existsSync(INVENTORY) ? JSON.parse(fs.readFileSync(INVENTORY, 'utf8')) : []
if (!inventory.length) problems.push(`${INVENTORY} is empty or missing: coverage cannot be assessed.`)

const routes = inventory.filter((p) => (p.profile ?? PROFILE) === PROFILE).map((p) => normaliseRoute(p.route))
if (inventory.length && !routes.length) {
  problems.push(`${INVENTORY} has no entries for UI_PROFILE=${PROFILE}. Add the profile dimension to the inventory.`)
}

const results = readAll('results')
const skipped = readAll('skipped')
const scanned = new Set(results.map((r) => r.route))
const byTemplate = new Set(skipped.filter((s) => s.reason === 'duplicate template').map((s) => s.route))
const seen = new Set([...scanned, ...skipped.map((s) => s.route)])

const waivers = fs.existsSync(WAIVERS) ? JSON.parse(fs.readFileSync(WAIVERS, 'utf8')) : []
const today = new Date().toISOString().slice(0, 10)
const waived = new Set()
for (const waiver of waivers) {
  if (!waiver.route || !waiver.reason) problems.push(`Waiver without a route or reason: ${JSON.stringify(waiver)}`)
  if (waiver.expires && waiver.expires < today) problems.push(`Waiver for ${waiver.route} expired on ${waiver.expires}. Re-review it.`)
  const route = normaliseRoute(waiver.route)
  if (!routes.includes(route)) problems.push(`Waiver for ${waiver.route} matches no inventory route in UI_PROFILE=${PROFILE}. Remove it.`)
  waived.add(route)
}

const uncovered = [...new Set(routes)].filter((route) => !seen.has(route) && !waived.has(route))
for (const route of uncovered) {
  problems.push(`${route} was never scanned, matched to a template, or waived. Add a journey that reaches it, or a reason in ${WAIVERS}.`)
}

const summary = {
  profile: PROFILE,
  inventoryRoutes: new Set(routes).size,
  scanned: scanned.size,
  coveredByTemplate: byTemplate.size,
  waived: waived.size,
  uncovered
}

if (JSON_OUT) {
  console.log(JSON.stringify({ ...summary, problems }, null, 2))
} else {
  console.log(`a11y coverage (UI_PROFILE=${PROFILE})`)
  console.log(`  inventory routes:   ${summary.inventoryRoutes}`)
  console.log(`  analysed by axe:    ${summary.scanned}`)
  console.log(`  covered by template: ${summary.coveredByTemplate}`)
  console.log(`  waived:             ${summary.waived}`)
  console.log(`  uncovered:          ${summary.uncovered.length}`)
  for (const p of problems) console.log(`PROBLEM: ${p}`)
}
process.exit(problems.length ? 1 : 0)
