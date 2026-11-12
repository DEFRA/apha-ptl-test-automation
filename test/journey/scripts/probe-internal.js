// Read-only live probe of the internal site: writes docs/internal/discovery/pages.json. Uses .auth/internal.json (run the setup project first).
import 'dotenv/config'
import fs from 'node:fs'
import { chromium } from '@playwright/test'
import { internal } from '../content/internal.js'

const base = process.env.PROFICIENCY_TESTING_WEB_URL.replace(/\/$/, '')
const browser = await chromium.launch()
const context = await browser.newContext({ storageState: '.auth/internal.json' })
const page = await context.newPage()

const describe = () =>
  page.evaluate(() => {
    const text = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim()
    const labelOf = (el) => text(document.querySelector(`label[for="${el.id}"]`)) || el.getAttribute('aria-label') || el.name
    const main = document.querySelector('main') ?? document.body
    return {
      h1: text(document.querySelector('h1')),
      h2: [...main.querySelectorAll('h2')].map(text),
      forms: [...main.querySelectorAll('form')].map((f) => ({
        method: f.method, action: f.getAttribute('action'),
        fields: [...f.querySelectorAll('input:not([type=hidden]),select,textarea')].map((e) => ({
          label: labelOf(e), tag: e.tagName.toLowerCase(), type: e.type, id: e.id, maxlength: e.getAttribute('maxlength'),
          options: e.tagName === 'SELECT' ? [...e.options].slice(0, 8).map((o) => text(o)) : undefined, optionCount: e.tagName === 'SELECT' ? e.options.length : undefined
        })),
        buttons: [...f.querySelectorAll('button,input[type=submit]')].map((b) => text(b) || b.value)
      })),
      tables: [...main.querySelectorAll('table')].map((t) => ({ headers: [...t.querySelectorAll('th')].map(text), rows: t.querySelectorAll('tbody tr').length })),
      links: [...main.querySelectorAll('a')].map((a) => ({ text: text(a), href: a.getAttribute('href') })).slice(0, 60),
      buttons: [...main.querySelectorAll('button,a.govuk-button')].map(text),
      nav: [...document.querySelectorAll('nav[aria-label="Primary navigation"] a')].map((a) => ({ text: text(a), href: a.getAttribute('href') })),
      pagination: !!main.querySelector('.govuk-pagination'), pageSize: !!main.querySelector('select[name=pageSize],#pageSize')
    }
  })

const out = {}
const queue = internal.list.map((p) => p.path)
const seen = new Set()
while (queue.length && seen.size < 150) {
  const path = queue.shift()
  if (seen.has(path)) continue
  seen.add(path)
  const response = await page.goto(base + path, { waitUntil: 'load', timeout: 60000 }).catch((e) => ({ status: () => `ERR ${e.message.slice(0, 60)}` }))
  const info = await describe().catch(() => ({}))
  out[path] = { status: response.status(), finalUrl: page.url().replace(base, ''), ...info }
  // follow one level of detail/drill-down links that carry an id
  for (const l of info.links ?? []) {
    if (/^\/(Customer|Participant|Contract|GroupAddress|Scheme|Distribution|ParticipantScheme)\/(Details|ContractItems|Edit|History|Viewers|Schedule|Tabulations|Participants)/i.test(l.href ?? '') && !seen.has(l.href) && queue.length < 120 && (l.href.match(/\//g) ?? []).length <= 3) {
      if (!Object.keys(out).some((k) => k.split('?')[0] === l.href.split('?')[0] && k.includes('?') === l.href.includes('?') && Object.keys(out).filter((k2) => k2.split('?')[0] === l.href.split('?')[0]).length >= 1)) queue.push(l.href)
    }
  }
}
fs.mkdirSync('docs/internal/discovery', { recursive: true })
fs.writeFileSync('docs/internal/discovery/pages.json', JSON.stringify(out, null, 1))
console.log(`${Object.keys(out).length} pages probed`)
await browser.close()
