// Live probe 3: submits create forms with synthetic data to learn the success flow. Creates records named QATPROBE*; run once.
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

const which = process.argv[2]
if (which === 'customer') {
  await page.goto(base + '/Customer/Create')
  await fill('Name', `QATPROBE ${stamp}`)
  await pick('Customer Type')
  await fill('Contact Name', 'Jane Smith')
  await fill('Organisation Name', 'QA Test Organisation')
  await fill('Address 1', '1 Test Street')
  await fill('Address 2', 'Testville')
  await pick('Country')
  await fill('Telephone', '01234 567890')
  await fill('Email', `qat.${stamp.toLowerCase()}@example.com`)
  await page.getByRole('button', { name: 'Create Customer', exact: true }).click()
  await report('customer create (minimal contact)')
}
if (which === 'customer2') {
  // second round: add invoice details too
  await page.goto(base + '/Customer/Create')
  await fill('Name', `QATPROBE ${stamp}`)
  await pick('Customer Type')
  await pick('Currency')
  await fill('Contact Name', 'Jane Smith')
  await fill('Organisation Name', 'QA Test Organisation')
  await fill('Address 1', '1 Test Street')
  await fill('Address 2', 'Testville')
  await pick('Country')
  await fill('Telephone', '01234 567890')
  await fill('Email', `qat.${stamp.toLowerCase()}@example.com`)
  await fill('Invoice Organisation Name', 'QA Test Organisation')
  await fill('Invoice Address 1', '1 Test Street')
  await fill('Invoice Address 2', 'Testville')
  await pick('Invoice country')
  await fill('Invoice Email', `qat.inv.${stamp.toLowerCase()}@example.com`)
  await page.getByRole('button', { name: 'Create Customer', exact: true }).click()
  await report('customer create (with invoice)')
}
await browser.close()

