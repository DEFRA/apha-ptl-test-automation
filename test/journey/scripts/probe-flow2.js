// Live probe 5: contract create/edit, participant/group address edit, pending/export/import pages. Uses QATPROBE records only.
import 'dotenv/config'
import { chromium } from '@playwright/test'

const base = process.env.PROFICIENCY_TESTING_WEB_URL.replace(/\/$/, '')
const browser = await chromium.launch()
const context = await browser.newContext({ storageState: '.auth/internal.json' })
const page = await context.newPage()
const stamp = Date.now().toString(36).toUpperCase()
const report = async (tag) => {
  const banners = (await page.locator('.govuk-notification-banner').allTextContents()).map((s) => s.replace(/\s+/g, ' ').trim()).filter((s) => !/Extend session/.test(s))
  console.log(tag, '|', page.url().replace(base, ''), '| h1:', (await page.locator('h1').first().textContent()).trim(), '| S:', JSON.stringify(await page.locator('.govuk-error-summary li').allTextContents()), '| B:', JSON.stringify(banners))
}
const fill = async (label, value) => page.getByLabel(label, { exact: true }).first().fill(value)
const btn = (name) => page.getByRole('button', { name, exact: true }).first()
const run = async (tag, fn) => { try { await fn(); await report(tag) } catch (e) { console.log(tag, 'ERR', e.message.split('\n')[0]) } }
const nav = () => page.locator('nav[aria-label="Primary navigation"]')
const dump = async (tag) => console.log(tag, JSON.stringify(await page.evaluate(() => {
  const t = (e) => (e?.textContent ?? '').replace(/\s+/g, ' ').trim()
  const m = document.querySelector('main')
  return { h1: t(m.querySelector('h1')), h2: [...m.querySelectorAll('h2')].map(t), p: [...m.querySelectorAll('p')].map(t).slice(0, 4), btn: [...m.querySelectorAll('button,a.govuk-button')].map(t), tbl: [...m.querySelectorAll('table')].map((x) => [...x.querySelectorAll('th')].map(t).join('/') + '#' + x.querySelectorAll('tbody tr').length), links: [...m.querySelectorAll('a.govuk-link')].map(t).slice(0, 8) }
})))

await page.goto(base + '/Search/Index?tab=Customers&Customer.Name=QATPROBE')
await page.locator('#customers').getByRole('link', { name: /^Details/ }).first().click()
const customerUrl = page.url()
await page.getByRole('link', { name: 'Go to Contracts Page', exact: true }).click()
const contractsUrl = page.url()

await run('contract create', async () => {
  await nav().getByRole('link', { name: 'Create Contract', exact: true }).click()
  await fill('Contract Signatory', 'Jane Smith')
  await btn('Create Contract').click()
})
await run('contract list after create', async () => { await page.goto(contractsUrl) })
await dump('contracts list')
await run('contract details', async () => { await page.getByRole('link', { name: 'Details', exact: true }).first().click() })
await dump('contract details')
await run('contract edit', async () => {
  await page.getByRole('link', { name: /Edit/ }).first().click()
  await fill('Contract Signatory', 'Janet Smith')
  await btn('Save Changes').click().catch(async () => btn('Save').click())
})

await run('participant edit', async () => {
  await page.goto(customerUrl)
  await page.getByRole('link', { name: 'Go to Participants Page', exact: true }).click()
  await page.getByRole('link', { name: 'Details', exact: true }).first().click()
  await page.getByRole('link', { name: /^Edit/ }).first().click()
  await fill('Contact Name', 'Janet Smith')
  await page.getByRole('button', { name: /^(Save|Update)/ }).first().click()
})
await run('group address edit', async () => {
  await page.goto(base + '/GroupAddress/Index')
  const rows = page.locator('main tbody tr', { hasText: 'QATPROBE' })
  await rows.first().getByRole('link', { name: /Details/ }).click()
  await page.getByRole('link', { name: /Edit/ }).first().click()
  await fill('Address 3', 'Testshire')
  await btn('Save').click()
})
for (const p of ['/Customer/ReviewPendingCustomerUpdates', '/Participant/ReviewPendingParticipantUpdates', '/Contract/ReviewPendingOrders', '/Contract/Exports', '/Contract/ImportPermits', '/Contract/RenewContracts']) {
  await page.goto(base + p); await dump(p)
}
await page.goto(base + '/Customer/ReviewPendingCustomerUpdates')
await page.getByRole('link', { name: /Details/ }).first().click().catch(() => {})
await dump('pending customer details')
await browser.close()
