// Read-only/validation-only live probe 2: submits invalid forms and records the error text. Nothing valid is submitted.
import 'dotenv/config'
import fs from 'node:fs'
import { chromium } from '@playwright/test'

const base = process.env.PROFICIENCY_TESTING_WEB_URL.replace(/\/$/, '')
const browser = await chromium.launch()
const context = await browser.newContext({ storageState: '.auth/internal.json' })
const page = await context.newPage()

const cases = [
  { path: '/SystemAdministration/ExternalTestConsultantManagement', button: 'Submit', fill: {} },
  { path: '/SystemAdministration/ExternalTestConsultantManagement', button: 'Submit', fill: { Name: 'QA Probe', Email: 'not-an-email' } },
  { path: '/SystemAdministration/ViewerManagement', button: 'Submit', fill: {} },
  { path: '/SystemAdministration/ViewerManagement', button: 'Submit', fill: { Name: 'QA Probe', Email: 'not-an-email' } },
  { path: '/SystemAdministration/CountryManagement', button: 'Submit', fill: {} },
  { path: '/SystemAdministration/CreateUser', button: 'Search', fill: {} },
  { path: '/SystemAdministration/ExternalSiteManagement', button: 'Save', fill: { 'Edit error screen email address': 'not-an-email' } },
  { path: '/SystemAdministration/AdministrationCharge', button: 'Save', fill: { 'GBP': 'abc' } },
  { path: '/SystemAdministration/AdministrationCharge', button: 'Save', fill: { 'GBP': '-5' } },
  { path: '/SchemeAdmin/CategoryItemType', button: 'Add', fill: {} },
  { path: '/SchemeAdmin/TestType', button: 'Add', fill: {} },
  { path: '/SchemeAdmin/CriterionItemType', button: 'Add', fill: {} },
  { path: '/SchemeAdmin/TestResultItemType', button: 'Add', fill: {} },
  { path: '/SchemeAdmin/TestMethodItemType', button: 'Add', fill: {} },
  { path: '/Scheme/Create', button: 'Save', fill: { Identifier: 'ABC' } },
  { path: '/Scheme/Create', button: 'Save', fill: {} },
  { path: '/GroupAddress/Create', button: 'Save', fill: { Telephone: 'abc' } },
  { path: '/Distribution/Search', button: 'Search', fill: {} },
  { path: '/Scheme/Search', button: 'Search', fill: { 'Scheme Name': 'zzzz-no-such-scheme' } }
]

const out = []
for (const c of cases) {
  await page.goto(base + c.path)
  for (const [label, value] of Object.entries(c.fill)) await page.getByLabel(label, { exact: label !== 'GBP' }).first().fill(value)
  const btn = page.getByRole('button', { name: new RegExp('^' + c.button) }).first()
  if (!(await btn.isVisible().catch(() => false))) {
    out.push({ ...c, error: 'button not found' })
    continue
  }
  await btn.click()
  await page.waitForLoadState('load')
  const info = await page.evaluate(() => {
    const t = (e) => (e?.textContent ?? '').replace(/\s+/g, ' ').trim()
    const main = document.querySelector('main') ?? document.body
    return {
      h1: t(main.querySelector('h1')),
      summary: [...main.querySelectorAll('.govuk-error-summary li')].map(t),
      inline: [...main.querySelectorAll('.govuk-error-message')].map(t),
      banner: [...main.querySelectorAll('.govuk-notification-banner')].map(t),
      text: t(main).slice(0, 300)
    }
  })
  out.push({ ...c, url: page.url().replace(base, ''), ...info })
}
fs.writeFileSync('docs/internal/discovery/validation-probe.json', JSON.stringify(out, null, 1))
for (const o of out) console.log(o.path, JSON.stringify(o.fill), '=>', o.url, '|', o.h1, '| S:', o.summary.join(' ; '), '| I:', o.inline.length, '| B:', o.banner.join(' ').slice(0, 100), o.summary.length ? '' : '| T: ' + o.text.slice(0, 160))
await browser.close()


