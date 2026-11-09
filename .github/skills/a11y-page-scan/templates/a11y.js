import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import AxeBuilder from '@axe-core/playwright'
import { PROFILE } from './profiles.js'
import { fingerprint, hash, normaliseRoute } from './page-key.js'

const DIR = path.resolve(process.env.A11Y_DIR ?? 'reports/a11y')
const KEEP_PARAMS = (process.env.A11Y_KEEP_PARAMS ?? '').split(',').filter(Boolean)
const BY_TEMPLATE = process.env.A11Y_DEDUPE_BY_TEMPLATE !== 'false'
const ENABLED = process.env.A11Y_SCAN !== 'false'
const ENFORCE = (process.env.A11Y_ENFORCE ?? String(PROFILE === 'gds')) === 'true'
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/** Remove results from the previous run. Call once from global setup. */
export function resetA11y() {
  fs.rmSync(DIR, { recursive: true, force: true })
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
 * Scan the current page with axe-core once per unique route + variant, and once per page template.
 * Duplicates are skipped and logged for the report.
 * @param {import('@playwright/test').Page} page
 * @param {{ variant?: string, role?: string }} [options]
 * @returns {Promise<{ scanned: boolean, violations: object[] }>}
 */
export async function scanPage(page, { variant = 'default', role = 'anonymous' } = {}) {
  if (!ENABLED) return { scanned: false, violations: [] }
  const url = page.url()
  const route = normaliseRoute(url, { keepParams: KEEP_PARAMS })

  if (!claim('route', [PROFILE, route, variant].join('|'))) {
    record('skipped', { url, route, variant, reason: 'duplicate route' })
    return { scanned: false, violations: [] }
  }

  const facts = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.textContent ?? '',
    landmarks: [...document.querySelectorAll('main,nav,header,footer,aside,form')].map((e) => e.tagName.toLowerCase()),
    controls: [...document.querySelectorAll('input,select,textarea,button')].map((e) => `${e.tagName.toLowerCase()}:${e.type ?? ''}`)
  }))
  if (BY_TEMPLATE && !claim('template', [PROFILE, variant, fingerprint(facts)].join('|'))) {
    record('skipped', { url, route, variant, reason: 'duplicate template' })
    return { scanned: false, violations: [] }
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
  record('results', {
    route, url, variant, role, profile: PROFILE, title: facts.title, h1: facts.h1,
    scannedAt: new Date().toISOString(),
    passes: results.passes.length, incomplete: results.incomplete.length, violations
  })

  if (ENFORCE && violations.length) {
    throw new Error(`Accessibility violations on ${route}: ${violations.map((v) => v.id).join(', ')}`)
  }
  return { scanned: true, violations }
}
