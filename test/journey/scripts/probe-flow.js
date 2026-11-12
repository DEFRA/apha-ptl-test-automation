// Live probe 4: walks create/edit flows for participant, group address and contract using synthetic data (QATPROBE*).
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
const pick = async (label, index = 1) => page.getByLabel(label, { exact: true }).first().selectOption({ index })
const btn = (name) => page.getByRole('button', { name, exact: true }).first()
const run = async (tag, fn) => { try { await fn(); await report(tag) } catch (e) { console.log(tag, 'ERR', e.message.split('\n')[0]) } }

// find a QATPROBE customer via search
await page.goto(base + '/Search/Index?tab=Customers&Customer.Name=QATPROBE')
await page.locator('#customers').getByRole('link', { name: /^Details/ }).first().click()
await report('customer details from search')
const customerUrl = page.url()

await run('customer edit', async () => {
  await page.getByRole('link', { name: 'Edit Customer', exact: true }).click()
  await fill('Contact Name', 'Janet Smith')
  await btn('Save Changes').click()
})

await run('participant create', async () => {
  await page.goto(customerUrl)
  await page.getByRole('link', { name: 'Go to Participants Page', exact: true }).click()
  await page.locator('nav[aria-label="Primary navigation"]').getByRole('link', { name: 'Create Participant', exact: true }).click()
  console.log('  lab code prefilled:', JSON.stringify(await page.getByLabel('Lab Code', { exact: true }).inputValue()))
  await fill('Lab Name', `QATPROBE Lab ${stamp}`)
  await pick('Lab Type').catch(() => {})
  await fill('Contact Name', 'Jane Smith')
  await fill('Organisation Name', 'QA Test Organisation')
  await fill('Address 1', '1 Test Street')
  await fill('Address 2', 'Testville')
  await pick('Country')
  await fill('Telephone', '01234 567890')
  await fill('Email (Primary)', `qat.lab.${stamp.toLowerCase()}@example.com`)
  await btn('Create Participant').click()
})

await run('group address create', async () => {
  await page.goto(base + '/GroupAddress/Create')
  await fill('Identifier', `QATPROBE ${stamp}`)
  await fill('Address 1', '1 Test Street')
  await fill('Address 2', 'Testville')
  await pick('Country')
  await btn('Save').click()
})

await run('contract create form', async () => {
  await page.goto(customerUrl)
  await page.getByRole('link', { name: 'Go to Contracts Page', exact: true }).click()
  await page.locator('nav[aria-label="Primary navigation"]').getByRole('link', { name: 'Create Contract', exact: true }).click()
  console.log('  fields:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('main input:not([type=hidden]),main select,main textarea')].map((e) => `${(document.querySelector(`label[for="${e.id}"]`)?.textContent ?? e.name).trim()}(${e.tagName === 'SELECT' ? 'sel:' + [...e.options].slice(0, 4).map((o) => o.text).join('|') : e.type}${e.value ? '=' + e.value : ''})`))))
})
await browser.close()
