import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { PROFILE } from './profiles.js'
import { normaliseRoute } from './page-key.js'

export const DIR = path.resolve(process.env.A11Y_DIR ?? 'reports/a11y')
const IMPACTS = ['critical', 'serious', 'moderate', 'minor']
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function readAll(folder) {
  const dir = path.join(DIR, folder)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
}

const css = ':root{color-scheme:light dark;font-family:system-ui,sans-serif}body{max-width:72rem;margin:2rem auto;padding:0 1rem;line-height:1.5}table{border-collapse:collapse;width:100%;margin:1rem 0}th,td{border:1px solid #8885;padding:.4rem .6rem;text-align:left;vertical-align:top}code{word-break:break-all}.critical,.serious{font-weight:700}.note{background:#8881;padding:.6rem .8rem;border-left:4px solid currentColor}'

function pageSection(p) {
  const rows = p.violations.map((v) => `<tr><td><a href="${esc(v.helpUrl)}">${esc(v.id)}</a><br>${esc(v.help)}</td><td class="${esc(v.impact)}">${esc(v.impact)}</td><td>${esc(v.tags.join(', '))}</td><td>${v.nodes.map((n) => `<code>${esc(n.target)}</code>`).join('<br>')}${v.nodeCount > v.nodes.length ? `<br>+${v.nodeCount - v.nodes.length} more` : ''}</td></tr>`).join('')
  const table = p.violations.length
    ? `<table><caption>Violations</caption><thead><tr><th scope="col">Rule</th><th scope="col">Impact</th><th scope="col">WCAG</th><th scope="col">Elements</th></tr></thead><tbody>${rows}</tbody></table>`
    : '<p>No violations found by automated checks.</p>'
  const role = p.role && p.role !== 'anonymous' ? ` Â· role ${esc(p.role)}` : ''
  const variant = p.variant === 'default' ? '' : ` (${esc(p.variant)})`
  return `<section><h2>${esc(p.route)}${variant}</h2><p>${esc(p.h1)}${role} Â· ${p.violations.length} violated rule(s) Â· ${p.passes} passed Â· ${p.incomplete} need review</p>${table}</section>`
}

/**
 * Build a11y-report.html and a11y-summary.json from the recorded scan results.
 *
 * Coverage is reported in three distinct buckets, because they are not the same thing:
 *   scanned            axe analysed this route
 *   coveredByTemplate  skipped as structurally identical to a scanned page; axe did not run
 *   notVisited         in the inventory for this profile and never reached by any test
 */
export function buildReport({ inventoryPath = 'data/page-inventory.json' } = {}) {
  const pages = readAll('results').sort((a, b) => a.route.localeCompare(b.route) || a.variant.localeCompare(b.variant))
  const skipped = readAll('skipped')
  const inventory = fs.existsSync(inventoryPath) ? JSON.parse(fs.readFileSync(inventoryPath, 'utf8')) : []

  const activeProfile = pages[0]?.profile ?? PROFILE
  const inventoryRoutes = inventory
    .filter((p) => (p.profile ?? activeProfile) === activeProfile)
    .map((p) => normaliseRoute(p.route))

  const scannedRoutes = new Set(pages.map((p) => p.route))
  const attemptedRoutes = new Set([...pages, ...skipped].map((p) => p.route))
  const dedupedByTemplate = [...new Set(skipped.filter((s) => s.reason === 'duplicate template').map((s) => s.route))]
  const notVisited = inventoryRoutes.filter((route) => !attemptedRoutes.has(route))

  const byImpact = Object.fromEntries(IMPACTS.map((i) => [i, 0]))
  const byRule = {}
  for (const p of pages) {
    for (const v of p.violations) {
      byImpact[v.impact] = (byImpact[v.impact] ?? 0) + 1
      byRule[v.id] = (byRule[v.id] ?? 0) + 1
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    profile: activeProfile,
    inventoryRoutes: inventoryRoutes.length,
    pagesScanned: pages.length,
    scannedRoutes: reliedOn(scannedRoutes),
    duplicatesSkipped: skipped.length,
    coveredByTemplate: dedupedByTemplate,
    pagesWithViolations: pages.filter((p) => p.violations.length).length,
    newViolations: pages.reduce((sum, p) => sum + (p.newViolationCount ?? 0), 0),
    violationsByImpact: byImpact,
    violationsByRule: byRule,
    notVisitedPages: notVisited
  }

  const impactRows = IMPACTS.map((i) => `<tr><th scope="row">${i}</th><td>${byImpact[i] ?? 0}</td></tr>`).join('')
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Accessibility scan report</title><style>${css}</style></head><body><main><h1>Accessibility scan report</h1>
<p>Profile ${esc(summary.profile)} Â· generated ${esc(summary.generatedAt)}. Automated checks find only part of the issues. Test keyboard use, screen readers, 320px reflow and 400% zoom manually.</p>
<h2>Summary</h2><table><caption>Scan totals</caption><tbody><tr><th scope="row">Inventory routes for this profile</th><td>${summary.inventoryRoutes}</td></tr><tr><th scope="row">Routes analysed by axe</th><td>${summary.pagesScanned}</td></tr><tr><th scope="row">Covered by a scanned template (not analysed)</th><td>${summary.coveredByTemplate.length}</td></tr><tr><th scope="row">Pages with violations</th><td>${summary.pagesWithViolations}</td></tr><tr><th scope="row">Violations not in the baseline</th><td>${summary.newViolations}</td></tr></tbody></table>
<table><caption>Violated rules by impact</caption><tbody>${impactRows}</tbody></table>
<h2>Routes in the inventory that no test reached</h2>${notVisited.length ? `<ul>${notVisited.map((r) => `<li><code>${esc(r)}</code></li>`).join('')}</ul>` : '<p>None.</p>'}
<h2>Routes covered by a template instead of being scanned</h2><p class="note">These routes were skipped because their structure matched a page already scanned. axe did not run on them, so treat their result as unknown. Disable with <code>A11Y_DEDUPE_BY_TEMPLATE=false</code> for an audit run.</p>${dedupedByTemplate.length ? `<ul>${dedupedByTemplate.map((r) => `<li><code>${esc(r)}</code></li>`).join('')}</ul>` : '<p>None.</p>'}
<h2>Results by page</h2>${pages.map(pageSection).join('') || '<p>No pages were scanned.</p>'}</main></body></html>`

  fs.mkdirSync(DIR, { recursive: true })
  fs.writeFileSync(path.join(DIR, 'a11y-report.html'), html)
  fs.writeFileSync(path.join(DIR, 'a11y-summary.json'), JSON.stringify(summary, null, 2))
  console.log(
    `a11y: ${summary.pagesScanned} analysed, ${summary.coveredByTemplate.length} by template, ` +
      `${summary.newViolations} new violation(s), ${summary.notVisitedPages.length} route(s) not visited -> ${path.join(DIR, 'a11y-report.html')}`
  )
  return summary
}

const reliedOn = (set) => [...set].sort()

/** Playwright globalTeardown: build the report after the run. */
export default async function globalTeardown() {
  buildReport()
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) buildReport()

