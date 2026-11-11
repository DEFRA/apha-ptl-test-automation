import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import AxeBuilder from '@axe-core/playwright'
import { PROFILE } from './profiles.js'
import { fingerprint, hash, normaliseRoute, violationKey } from './page-key.js'

export const DIR = path.resolve(process.env.A11Y_DIR ?? 'reports/a11y')
const KEEP_PARAMS = (process.env.A11Y_KEEP_PARAMS ?? '').split(',').filter(Boolean)
const BY_TEMPLATE = process.env.A11Y_DEDUPE_BY_TEMPLATE !== 'false'
const ENABLED = process.env.A11Y_SCAN !== 'false'
const ENFORCE = (process.env.A11Y_ENFORCE ?? 'false') === 'true'
// Scans are reported in reports/a11y but never fail a test unless A11Y_FAIL_ON_NEW or A11Y_ENFORCE is set to true.
const FAIL_ON_NEW = (process.env.A11Y_FAIL_ON_NEW ?? 'false') === 'true'
const BASELINE_FILE = path.resolve(process.env.A11Y_BASELINE ?? 'docs/a11y-baseline.json')
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/** Remove results from the previous run. Call once from global setup. */
export function resetA11y() {
  fs.rmSync(DIR, { recursive: true, force: true })
}

let baselineCache = null

/**
 * Known violations for the active profile, from docs/a11y-baseline.json.
 * Shape: { "legacy": ["/route|rule|target", ...], "gds": [...] }
 * @returns {Set<string>}
 */
export function loadBaseline() {
  if (baselineCache) return baselineCache
  // Report-only runs do not need a baseline; every violation is then listed as new in the report.
  if (!FAIL_ON_NEW && !ENFORCE && !fs.existsSync(BASELINE_FILE)) return new Set()
  if (!fs.existsSync(BASELINE_FILE)) {
    throw new Error(`Accessibility baseline is missing: ${BASELINE_FILE}. Create it or set A11Y_BASELINE.`)
  }
  let all
  try {
    all = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'))
  } catch (error) {
    throw new Error(`Accessibility baseline is unreadable: ${BASELINE_FILE}: ${error.message}`)
  }
  if (!Array.isArray(all[PROFILE])) {
    throw new Error(`Accessibility baseline has no array for profile "${PROFILE}": ${BASELINE_FILE}`)
  }
  baselineCache = new Set(all[PROFILE])
  return baselineCache
}

/** Claim a key across all workers. Exclusive file creation is atomic, so only one worker wins. */
function claim(kind, key) {
  const dir = path.join(DIR, '.seen')
  fs.mkdirSync(dir, { recursive: true })
  try {
    fs.writeFileSync(path.join(dir, `${kind}-${hash(key)}`), key, { flag: 'wx' })
    return true
  } catch (error) {
    if (error.code === 'EEXIST') return false
    throw error
  }
}

function record(folder, data) {
  const dir = path.join(DIR, folder)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${randomUUID()}.json`), JSON.stringify(data))
}

/**
 * Scan the current page with axe-core once per unique route + variant + role, and once per
 * page template. Duplicates are skipped and recorded with the reason, so the report can tell
 * "scanned", "covered by a template" and "never visited" apart.
 * @param {import('@playwright/test').Page} page
 * @param {{ variant?: string, role?: string }} [options]
 * @returns {Promise<{ scanned: boolean, skipped?: string, violations: object[], newViolations: string[] }>}
 */
export async function scanPage(page, { variant = 'default', role = 'anonymous' } = {}) {
  if (!ENABLED) return { scanned: false, skipped: 'disabled', violations: [], newViolations: [] }
  const url = page.url()
  const route = normaliseRoute(url, { keepParams: KEEP_PARAMS })

  if (!claim('route', [PROFILE, route, variant, role].join('|'))) {
    record('skipped', { url, route, variant, role, reason: 'duplicate route' })
    return { scanned: false, skipped: 'duplicate route', violations: [], newViolations: [] }
  }

  const facts = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.textContent ?? '',
    landmarks: [...document.querySelectorAll('main,nav,header,footer,aside,form')].map((e) => e.tagName.toLowerCase()),
    controls: [...document.querySelectorAll('input,select,textarea,button')].map((e) => `${e.tagName.toLowerCase()}:${e.type ?? ''}`)
  }))
  if (BY_TEMPLATE && !claim('template', [PROFILE, variant, fingerprint(facts)].join('|'))) {
    record('skipped', { url, route, variant, role, reason: 'duplicate template' })
    return { scanned: false, skipped: 'duplicate template', violations: [], newViolations: [] }
  }

  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  // Element snippets can contain page text. Run only against synthetic data.
  const violations = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    helpUrl: v.helpUrl,
    tags: v.tags.filter((tag) => tag.startsWith('wcag')),
    nodeCount: v.nodes.length,
    nodes: v.nodes.slice(0, 5).map((n) => ({ target: [n.target].flat(2).join(' '), html: n.html.slice(0, 200) }))
  }))

  const known = loadBaseline()
  const newViolations = violations.filter((v) => !known.has(violationKey(route, v))).map((v) => violationKey(route, v))

  record('results', {
    route, url, variant, role, profile: PROFILE, title: facts.title, h1: facts.h1,
    scannedAt: new Date().toISOString(),
    passes: results.passes.length, incomplete: results.incomplete.length,
    violations, newViolationCount: newViolations.length
  })

  if (ENFORCE && violations.length) {
    throw new Error(`Accessibility violations on ${route} (${PROFILE}): ${violations.map((v) => v.id).join(', ')}`)
  }
  if (FAIL_ON_NEW && !ENFORCE && newViolations.length) {
    throw new Error(
      `New accessibility violations on ${route} (${PROFILE}): ${newViolations.join(', ')}. ` +
        `Fix them, or refresh the baseline deliberately with: node scripts/a11y-baseline.js --update`
    )
  }
  return { scanned: true, violations, newViolations }
}
