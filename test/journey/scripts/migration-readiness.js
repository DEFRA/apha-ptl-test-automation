#!/usr/bin/env node
/**
 * Migration readiness report: how much of the locator layer is profile-dependent, and
 * whether the `legacy-only` markers in code match the migration register.
 *
 * Run from test/journey:
 *   node scripts/migration-readiness.js            report only
 *   node scripts/migration-readiness.js --strict   exit 1 on orphan markers or rows
 *   node scripts/migration-readiness.js --cutover  exit 1 while any legacy marker remains
 *   node scripts/migration-readiness.js --json     machine-readable output
 *
 * The number it reports is an indicator, not a proof: it counts locator call sites, not
 * behavioural coverage. It exists so "the suite is 95% shared" is a measurement and not
 * an assertion.
 */
import fs from 'node:fs'
import path from 'node:path'

const args = new Set(process.argv.slice(2))
const STRICT = args.has('--strict')
const CUTOVER = args.has('--cutover')
const JSON_OUT = args.has('--json')
// The component wrappers ship with the pack and are generic. Their markers are informational
// until a project adopts them, so they are excluded from the register check by default.
const INCLUDE_COMPONENTS = args.has('--include-components')
const isTemplate = (file) => file.replace(/\\/g, '/').startsWith('components/')
const SCAN_DIRS = ['pages', 'components', 'flows', 'steps', 'content', 'assertions']
const REGISTER = path.join('docs', '05-migration-register.md')
const LOCATOR = /\.(getByRole|getByLabel|getByText|getByTestId|getByPlaceholder|locator)\s*\(/g
const MARKER = /\/\/\s*legacy-only:/i

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith('.js')).map((f) => path.join(dir, String(f)))
    : []

/** Read source into a form where strings and comments are blanked, so parens balance. */
function strip(source) {
  let out = ''
  let i = 0
  let quote = null
  while (i < source.length) {
    const c = source[i]
    const next = source[i + 1]
    if (quote) {
      if (c === '\\') { out += '  '; i += 2; continue }
      if (c === quote) { out += c; quote = null; i += 1; continue }
      out += c === '\n' ? '\n' : ' '
      i += 1
      continue
    }
    if (c === '/' && next === '/') { while (i < source.length && source[i] !== '\n') { out += ' '; i += 1 } continue }
    if (c === '/' && next === '*') {
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) { out += source[i] === '\n' ? '\n' : ' '; i += 1 }
      out += '  '; i += 2; continue
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; out += c; i += 1; continue }
    out += c
    i += 1
  }
  return out
}

/** Character ranges covered by every `name(` call, paren-balanced. */
function callSpans(clean, name) {
  const spans = []
  const re = new RegExp(`\\b${name}\\s*\\(`, 'g')
  let match
  while ((match = re.exec(clean))) {
    let depth = 0
    let i = match.index + match[0].length - 1
    for (; i < clean.length; i += 1) {
      if (clean[i] === '(') depth += 1
      else if (clean[i] === ')') { depth -= 1; if (depth === 0) break }
    }
    spans.push([match.index, i])
    re.lastIndex = i
  }
  return spans
}

const inside = (index, spans) => spans.some(([a, b]) => index >= a && index <= b)

const files = SCAN_DIRS.flatMap(walk)
const perFile = []
let total = 0
let dependent = 0
const markers = []

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  const clean = strip(source)
  const spans = callSpans(clean, 'byProfile')
  let sites = 0
  let inProfile = 0
  for (const m of clean.matchAll(LOCATOR)) {
    sites += 1
    if (inside(m.index ?? 0, spans)) inProfile += 1
  }
  if (sites) perFile.push({ file, sites, profileDependent: inProfile })
  total += sites
  dependent += inProfile
  source.split(/\r?\n/).forEach((line, n) => {
    if (MARKER.test(line)) markers.push(`${file}:${n + 1}`)
  })
}

const registerRows = fs.existsSync(REGISTER)
  ? fs.readFileSync(REGISTER, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.trim().startsWith('|'))
      .map((line) => line.split('|')[1]?.trim().replace(/`/g, '') ?? '')
      .filter((cell) => /:\d+$/.test(cell))
  : []

const relevantMarkers = INCLUDE_COMPONENTS ? markers : markers.filter((m) => !isTemplate(m))
const relevantRows = INCLUDE_COMPONENTS ? registerRows : registerRows.filter((r) => !isTemplate(r))
const orphanMarkers = relevantMarkers.filter((m) => !relevantRows.includes(m))
const orphanRows = relevantRows.filter((r) => !relevantMarkers.includes(r))
const sharedShare = total ? Math.round(((total - dependent) / total) * 1000) / 10 : 100

const report = {
  profile: (process.env.UI_PROFILE ?? 'legacy').toLowerCase(),
  locatorSites: total,
  profileDependentSites: dependent,
  sharedLocatorShare: sharedShare,
  legacyMarkers: relevantMarkers.length,
  templateMarkers: markers.length - relevantMarkers.length,
  registerRows: relevantRows.length,
  orphanMarkers,
  orphanRows,
  perFile: perFile.sort((a, b) => b.profileDependent - a.profileDependent)
}

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(`Migration readiness (UI_PROFILE=${report.profile})`)
  console.log(`  locator sites:        ${report.locatorSites}`)
  console.log(`  profile-dependent:    ${report.profileDependentSites}  (shared: ${report.sharedLocatorShare}%)`)
  console.log(`  legacy-only markers:  ${report.legacyMarkers}`)
  console.log(`  template markers:     ${report.templateMarkers} (components/, informational)`)
  console.log(`  register rows:        ${report.registerRows}`)
  console.log(`  orphan markers:       ${report.orphanMarkers.length}`)
  console.log(`  orphan register rows: ${report.orphanRows.length}`)
  if (report.perFile.length) {
    console.log('  by file:')
    for (const f of report.perFile) {
      console.log(`    ${f.file.padEnd(38)} ${String(f.sites).padStart(4)} sites, ${String(f.profileDependent).padStart(3)} profile-dependent`)
    }
  }
  for (const m of orphanMarkers) console.log(`PROBLEM: ${m} has a legacy-only marker but no row in ${REGISTER}`)
  for (const r of orphanRows) console.log(`PROBLEM: ${REGISTER} has a row for ${r} but no legacy-only marker`)
}

const failed = orphanMarkers.length > 0 || orphanRows.length > 0 || (CUTOVER && (markers.length > 0 || dependent > 0))
if (failed && (STRICT || CUTOVER)) {
  if (CUTOVER && (markers.length || dependent)) {
    console.log(`PROBLEM: cutover not complete: ${markers.length} legacy-only marker(s), ${dependent} profile-dependent locator site(s) remain.`)
  }
  process.exit(1)
}
