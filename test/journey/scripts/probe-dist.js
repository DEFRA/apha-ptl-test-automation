// Live probe 7: read-only walk of the distribution workflow pages from the Distributions list.
import 'dotenv/config'
import { chromium } from '@playwright/test'

const base = process.env.PROFICIENCY_TESTING_WEB_URL.replace(/\/$/, '')
const browser = await chromium.launch()
const context = await browser.newContext({ storageState: '.auth/internal.json' })
const page = await context.newPage()
const dump = async (tag) => console.log(tag, '|', page.url().replace(base, ''), JSON.stringify(await page.evaluate(() => {
  const t = (e) => (e?.textContent ?? '').replace(/\s+/g, ' ').trim()
  const m = document.querySelector('main')
  return { s: document.title.slice(0, 0), h1: t(m.querySelector('h1')), h2: [...m.querySelectorAll('h2')].map(t).slice(0, 4), p: [...m.querySelectorAll('p')].map(t).slice(0, 3), btn: [...m.querySelectorAll('button,a.govuk-button')].map(t).slice(0, 8), f: [...m.querySelectorAll('input:not([type=hidden]),select,textarea')].length, tbl: [...m.querySelectorAll('table')].map((x) => [...x.querySelectorAll('th')].map(t).slice(0, 6).join('/') + '#' + x.querySelectorAll('tbody tr').length).slice(0, 3), nav: [...document.querySelectorAll('nav[aria-label="Primary navigation"] a')].map(t) }
})).slice(0, 700))

await page.goto(base + '/Distribution/Index')
const links = await page.locator('main table a').evaluateAll((as) => as.map((a) => ({ t: a.textContent.trim(), h: a.getAttribute('href') })))
console.log('index links', JSON.stringify(links.slice(0, 14)))
const seen = new Set()
for (const l of links) {
  const key = l.h.split('?')[0]
  if (seen.has(key)) continue
  seen.add(key)
  await page.goto(base + l.h); await dump(l.t + ' ->')
}
await browser.close()
