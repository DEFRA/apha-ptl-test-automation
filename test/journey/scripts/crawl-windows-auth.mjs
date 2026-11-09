#!/usr/bin/env node
/* eslint-disable -- copy of the shipped crawler with the Windows-auth browser flag */
/**
 * Read-only discovery crawler. Same origin only, breadth first, hard page limit, and it never
 * submits a form, never clicks delete/cancel/logout and never follows an edge link twice.
 *
 * Run from test/journey, after the harness is scaffolded and `npm ci` has run there, because
 * it imports Playwright and reuses the saved auth state.
 *   node ../../.github/skills/api-ui-discovery/templates/crawl.mjs \
 *     --base https://service.test.example.gov.uk \
 *     --out docs/discovery/crawl.json \
 *     --auth .auth/applicant.json \
 *     --depth 3 --max 50
 *
 * Options
 *   --base <url>        start page (default UI_BASE_URL)
 *   --out <path>        output JSON (default docs/discovery/crawl.json)
 *   --auth <path>       storageState for the crawl role; omit to crawl anonymously
 *   --depth <n>         link depth from the start page (default 3)
 *   --max <n>           maximum pages (default 50)
 *   --accept-cookies    click the GOV.UK cookie banner's accept button once (a form submit;
 *                       off by default because the crawl is read-only)
 *   --include <regex>   only follow URLs whose path matches
 *   --exclude <regex>   never follow URLs whose path matches
 *   --playwright <dir> resolve @playwright/test from this directory's node_modules
 *                       (default: the current working directory)
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const args = process.argv.slice(2)
const arg = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}
const BASE = (arg('--base', process.env.UI_BASE_URL) ?? '').replace(/\/$/, '')
const OUT = arg('--out', path.join('docs', 'discovery', 'crawl.json'))
const AUTH = arg('--auth', null)
const DEPTH = Number(arg('--depth', '3'))
const MAX = Number(arg('--max', '50'))
const ACCEPT_COOKIES = args.includes('--accept-cookies')
const INCLUDE = arg('--include', null) ? new RegExp(arg('--include')) : null
const EXCLUDE = arg('--exclude', null) ? new RegExp(arg('--exclude')) : null

if (!BASE) {
  console.error('No base URL. Pass --base or set UI_BASE_URL.')
  process.exit(2)
}

/** Resolve Playwright from the calling project, so this file can live in .github/skills. */
const moduleRoot = arg('--playwright', process.cwd())
const cwdRequire = createRequire(path.join(moduleRoot, 'package.json'))
let chromium
try {
  ;({ chromium } = cwdRequire('@playwright/test'))
} catch (error) {
  console.error(
    `Cannot load @playwright/test from ${moduleRoot}. Run this from test/journey after 'npm ci', ` +
      `or pass --playwright <path-to-node_modules-parent>. (${error.message})`
  )
  process.exit(2)
}

const DESTRUCTIVE = /\b(log ?out|sign ?out|delete|remove|cancel|discard|withdraw)\b/i
const origin = new URL(BASE).origin

const browser = await chromium.launch({ args: ['--auth-server-allowlist=localhost'] })
const context = await browser.newContext({
  baseURL: BASE,
  storageState: AUTH && fs.existsSync(AUTH) ? AUTH : undefined,
  userAgent: 'defra-e2e-discovery-crawler (read-only)'
})
const page = await context.newPage()

const seen = new Set()
const queue = [{ url: '/', depth: 0, from: null }]
const pages = []
const edgeVisits = []

const normalise = (href, base) => {
  try {
    const url = new URL(href, base)
    url.hash = ''
    return url
  } catch {
    return null
  }
}

if (ACCEPT_COOKIES) {
  await page.goto('/')
  const accept = page.locator('.govuk-cookie-banner').getByRole('button', { name: /accept/i })
  if (await accept.isVisible().catch(() => false)) {
    await accept.click()
    const hide = page.locator('.govuk-cookie-banner').getByRole('button', { name: /hide/i })
    if (await hide.isVisible().catch(() => false)) await hide.click()
  }
}

while (queue.length && pages.length < MAX) {
  const item = queue.shift()
  const url = normalise(item.url, BASE)
  if (!url || url.origin !== origin) continue
  if (seen.has(url.pathname + url.search)) continue
  if (INCLUDE && !INCLUDE.test(url.pathname)) continue
  if (EXCLUDE && EXCLUDE.test(url.pathname)) continue
  seen.add(url.pathname + url.search)

  const response = await page.goto(url.pathname + url.search, { waitUntil: 'domcontentloaded' }).catch(() => null)
  if (!response || response.status() >= 400) {
    pages.push({ route: url.pathname, status: response?.status() ?? 'error', skipped: true })
    continue
  }

  const facts = await page.evaluate(() => {
    const text = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim()
    // Which landmark a link sits in, so the inventory knows what is chrome and what is content.
    const regionOf = (el) => {
      const landmark = el.closest('header, nav, main, footer, [role=banner], [role=navigation], [role=main], [role=contentinfo]')
      if (!landmark) return 'other'
      const tag = landmark.tagName.toLowerCase()
      if (tag === 'header' || landmark.getAttribute('role') === 'banner') return 'banner'
      if (tag === 'nav' || landmark.getAttribute('role') === 'navigation') return 'navigation'
      if (tag === 'footer' || landmark.getAttribute('role') === 'contentinfo') return 'contentinfo'
      return 'main'
    }
    return {
      title: document.title,
      h1: text(document.querySelector('h1')),
      headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => `${h.tagName}: ${text(h)}`).slice(0, 20),
      labels: [...document.querySelectorAll('label')].map((l) => text(l)).filter(Boolean).slice(0, 60),
      controls: [...document.querySelectorAll('input,select,textarea,button')].map((el) => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') ?? '',
        name: el.getAttribute('name') ?? '',
        id: el.id ?? '',
        required: el.hasAttribute('required'),
        maxLength: el.getAttribute('maxlength') ?? ''
      })).slice(0, 80),
      links: [...document.querySelectorAll('a[href]')].map((a) => ({
        text: text(a).slice(0, 80),
        href: a.getAttribute('href'),
        region: regionOf(a),
        newTab: a.getAttribute('target') === '_blank'
      }))
    }
  })

  pages.push({
    route: url.pathname + url.search,
    url: url.toString(),
    depth: item.depth,
    title: facts.title,
    h1: facts.h1,
    headings: facts.headings,
    labels: facts.labels,
    controls: facts.controls,
    linkCount: facts.links.length
  })

  const candidates = []
  for (const link of facts.links) {
    if (!link.href || /^(mailto|tel|javascript):/i.test(link.href)) continue
    if (DESTRUCTIVE.test(link.text) || DESTRUCTIVE.test(link.href)) continue
    const next = normalise(link.href, url)
    if (!next) continue

    // Edge links: logo (banner) and footer links are visited once, never expanded.
    const isEdge = link.region === 'contentinfo' || (link.region === 'banner' && !/nav/i.test(link.text))
    if (isEdge) {
      const key = `${link.region}:${link.text}:${next.href}`
      if (!edgeVisits.some((e) => e.key === key)) {
        edgeVisits.push({ key, region: link.region, text: link.text, href: next.href, newTab: link.newTab })
      }
      continue
    }

    if (next.origin !== origin) {
      edgeVisits.push({ key: `external:${next.href}`, region: 'external', text: link.text, href: next.href, newTab: link.newTab })
      continue
    }
    if (item.depth + 1 <= DEPTH) candidates.push({ url: next.pathname + next.search, depth: item.depth + 1, from: url.pathname })
  }
  queue.push(...candidates)
}

// Visit each edge link once and record its destination. No expansion, no scanning.
for (const edge of edgeVisits.filter((e) => e.region !== 'external')) {
  const before = page.url()
  const response = await page.goto(edge.href, { waitUntil: 'domcontentloaded' }).catch(() => null)
  const facts = response && response.status() < 400
    ? await page.evaluate(() => ({
        title: document.title,
        h1: (document.querySelector('h1')?.textContent ?? '').replace(/\s+/g, ' ').trim()
      }))
    : { title: '', h1: '' }
  edge.destination = response?.status() ?? 'error'
  edge.destinationTitle = facts.title
  edge.destinationH1 = facts.h1
  await page.goto(before, { waitUntil: 'domcontentloaded' }).catch(() => {})
}

const crawl = {
  crawledAt: new Date().toISOString(),
  base: BASE,
  depth: DEPTH,
  limit: MAX,
  auth: AUTH ?? 'anonymous',
  pages,
  edgeLinks: edgeVisits.map(({ key, ...rest }) => rest),
  overflow: queue.length > 0
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, `${JSON.stringify(crawl, null, 2)}\n`)
console.log(`crawled ${pages.length} page(s), ${crawl.edgeLinks.length} edge link(s) -> ${OUT}`)
if (crawl.overflow) console.log(`NOTE: stopped at the --max limit; raise --max or narrow --include to reach the rest.`)
await browser.close()

