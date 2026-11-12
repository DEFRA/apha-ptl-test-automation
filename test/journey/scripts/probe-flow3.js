// Live probe 6: pending-update decision pages, exports navigation, contract items. Never confirms an approve/decline.
import 'dotenv/config'
import { chromium } from '@playwright/test'

const base = process.env.PROFICIENCY_TESTING_WEB_URL.replace(/\/$/, '')
const browser = await chromium.launch()
const context = await browser.newContext({ storageState: '.auth/internal.json', acceptDownloads: true })
const page = await context.newPage()
const dump = async (tag) => console.log(tag, '|', page.url().replace(base, ''), JSON.stringify(await page.evaluate(() => {
  const t = (e) => (e?.textContent ?? '').replace(/\s+/g, ' ').trim()
  const m = document.querySelector('main')
  return { h1: t(m.querySelector('h1')), h2: [...m.querySelectorAll('h2')].map(t), p: [...m.querySelectorAll('p')].map(t).slice(0, 5), btn: [...m.querySelectorAll('button,a.govuk-button')].map(t), f: [...m.querySelectorAll('input:not([type=hidden]),select,textarea')].map((e) => (document.querySelector(`label[for="${e.id}"]`)?.textContent ?? e.name).trim() + '(' + e.type + ')').slice(0, 10), tbl: [...m.querySelectorAll('table')].map((x) => [...x.querySelectorAll('th')].map(t).slice(0, 6).join('/') + '#' + x.querySelectorAll('tbody tr').length), nav: [...document.querySelectorAll('nav[aria-label="Primary navigation"] a')].map(t) }
})))

await page.goto(base + '/Contract/ManageContracts'); await dump('manage contracts')
await page.goto(base + '/Contract/Exports'); await dump('exports')
for (const p of ['/Contract/ExportContracts', '/Contract/ExportJobSheets', '/Contract/ExportRenewalLetters', '/Contract/ExportAddressConfirmationLetters']) { await page.goto(base + p); await dump(p) }

await page.goto(base + '/Search/Index?tab=Customers&Customer.Name=QATPROBE')
await page.locator('#customers').getByRole('link', { name: /^Details/ }).first().click()
await page.getByRole('link', { name: 'Go to Contracts Page', exact: true }).click()
await page.getByRole('link', { name: 'Contract Items', exact: true }).first().click(); await dump('contract items')
await page.getByRole('link', { name: 'Import Permit(s)', exact: true }).first().click().catch(() => {}); await dump('import permit (contracts list link)')
await browser.close()

