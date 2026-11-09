import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { normaliseRoute } from './page-key.js'

const DIR = path.resolve(process.env.A11Y_DIR ?? 'reports/a11y')
const IMPACTS = ['critical', 'serious', 'moderate', 'minor']
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function readAll(folder) {
  const dir = path.join(DIR, folder)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
}

const css = ':root{color-scheme:light dark;font-family:system-ui,sans-serif}body{max-width:72rem;margin:2rem auto;padding:0 1rem;line-height:1.5}table{border-collapse:collapse;width:100%;margin:1rem 0}th,td{border:1px solid #8885;padding:.4rem .6rem;text-align:left;vertical-align:top}code{word-break:break-all}.critical,.serious{font-weight:700}'

function pageSection(p) {
  const rows = p.violations.map((v) => `<tr><td><a href="${esc(v.helpUrl)}">${esc(v.id)}</a><br>${esc(v.help)}</td><td class="${esc(v.impact)}">${esc(v.impact)}</td><td>${esc(v.tags.join(', '))}</td><td>${v.nodes.map((n) => `<code>${esc(n.target)}</code>`).join('<br>')}${v.nodeCount > v.nodes.length ? `<br>+${v.nodeCount - v.nodes.length} more` : ''}</td></tr>`).join('')
  const table = p.violations.length
    ? `<table><caption>Violations</caption><thead><tr><th scope="col">Rule</th><th scope="col">Impact</th><th scope="col">WCAG</th><th scope="col">Elements</th></tr></thead><tbody>${rows}</tbody></table>`
    : '<p>No violations found by automated checks.</p>'
  return `<section><h2>${esc(p.route)}${p.variant === 'default' ? '' : ` (${esc(p.variant)})`}</h2><p>${esc(p.h1)} · role ${esc(p.role)} · ${p.violations.length} violated rule(s) · ${p.passes} passed · ${p.incomplete} need review</p>${table}</section>`
}

/** Build a11y-report.html and a11y-summary.json from the recorded scan results. */
export function buildReport({ inventoryPath = 'data/page-inventory.json' } = {}) {
  const pages = readAll('results').sort((a, b) => a.route.localeCompare(b.route) || a.variant.localeCompare(b.variant))
  const skipped = readAll('skipped')
  const inventory = fs.existsSync(inventoryPath) ? JSON.parse(fs.readFileSync(inventoryPath, 'utf8')) : []
  const covered = new Set([...pages, ...skipped].map((p) => p.route))
  const unscanned = inventory.filter((p) => !covered.has(normaliseRoute(p.route))).map((p) => p.route)

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
    profile: pages[0]?.profile ?? process.env.UI_PROFILE ?? 'legacy',
    pagesScanned: pages.length,
    duplicatesSkipped: skipped.length,
    pagesWithViolations: pages.filter((p) => p.violations.length).length,
    violationsByImpact: byImpact,
    violationsByRule: byRule,
    unscannedPages: unscanned
  }

  const impactRows = IMPACTS.map((i) => `<tr><th scope="row">${i}</th><td>${byImpact[i] ?? 0}</td></tr>`).join('')
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Accessibility scan report</title><style>${css}</style></head><body><main><h1>Accessibility scan report</h1>
<p>Profile ${esc(summary.profile)} · generated ${esc(summary.generatedAt)}. Automated checks find only part of the issues. Test keyboard use, screen readers, 320px reflow and 400% zoom manually.</p>
<h2>Summary</h2><table><caption>Scan totals</caption><tbody><tr><th scope="row">Pages scanned</th><td>${summary.pagesScanned}</td></tr><tr><th scope="row">Duplicate pages skipped</th><td>${summary.duplicatesSkipped}</td></tr><tr><th scope="row">Pages with violations</th><td>${summary.pagesWithViolations}</td></tr></tbody></table>
<table><caption>Violated rules by impact</caption><tbody>${impactRows}</tbody></table>
<h2>Pages in the inventory that were not scanned</h2>${unscanned.length ? `<ul>${unscanned.map((r) => `<li><code>${esc(r)}</code></li>`).join('')}</ul>` : '<p>None.</p>'}
<h2>Results by page</h2>${pages.map(pageSection).join('') || '<p>No pages were scanned.</p>'}</main></body></html>`

  fs.mkdirSync(DIR, { recursive: true })
  fs.writeFileSync(path.join(DIR, 'a11y-report.html'), html)
  fs.writeFileSync(path.join(DIR, 'a11y-summary.json'), JSON.stringify(summary, null, 2))
  console.log(`a11y: ${summary.pagesScanned} scanned, ${summary.duplicatesSkipped} duplicates skipped, ${summary.pagesWithViolations} with violations -> ${path.join(DIR, 'a11y-report.html')}`)
  return summary
}

/** Playwright globalTeardown: build the report after the run. */
export default async function globalTeardown() {
  buildReport()
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) buildReport()
