// Live probe 8: uploads the synthetic template, observes selection and export, then restores the original selection and deletes it.
import 'dotenv/config'
import { chromium } from '@playwright/test'

const base = process.env.PROFICIENCY_TESTING_WEB_URL.replace(/\/$/, '')
const NAME = 'QATContractTemplate.docx'
const browser = await chromium.launch()
const context = await browser.newContext({ storageState: '.auth/internal.json', acceptDownloads: true })
const page = await context.newPage()
const rows = () => page.locator('main tbody tr')
const state = async (tag) => console.log(tag, '|', page.url().replace(base, ''), '| rows:', JSON.stringify(await rows().evaluateAll((r) => r.map((x) => (x.className.includes('selected') ? '*' : '') + x.cells[0].textContent.trim()))), '| banner:', JSON.stringify((await page.locator('.govuk-notification-banner').allTextContents()).map((s) => s.replace(/\s+/g, ' ').trim()).filter((s) => !/Extend session/.test(s))), '| text:', (await page.locator('main').innerText()).replace(/\s+/g, ' ').match(/(Error|Success)[^.]{0,60}/)?.[0])

await page.goto(base + '/Contract/ExportContracts')
const original = (await page.locator('main tbody tr.ptl-template-selected td').first().textContent()).trim()
console.log('original selected:', original)
try {
  await page.getByLabel('Upload a template').setInputFiles('data/files/' + NAME)
  await page.getByRole('button', { name: 'Upload', exact: true }).click()
  await page.waitForLoadState('load'); await state('after upload')
  await rows().filter({ hasText: NAME }).getByRole('button', { name: /Select/ }).click(); await page.waitForLoadState('load'); await state('after select')
  let dl = null; page.on('download', (d) => { dl = d.suggestedFilename() })
  const t0 = Date.now()
  await page.getByRole('button', { name: 'Export', exact: true }).click().catch((e) => console.log('click err', e.message.split('\n')[0]))
  for (let i = 0; i < 40 && !dl; i++) await page.waitForTimeout(1000)
  console.log('export with', (await page.locator('main tbody tr.ptl-template-selected td').first().textContent().catch(() => '?'))?.trim(), '=> download:', dl, 'after', Date.now() - t0, 'ms')
} finally {
  await page.goto(base + '/Contract/ExportContracts')
  const sel = (await page.locator('main tbody tr.ptl-template-selected td').first().textContent()).trim()
  if (sel !== original) await rows().filter({ hasText: original }).getByRole('button', { name: /Select/ }).click()
  await page.goto(base + '/Contract/ExportContracts')
  const ours = rows().filter({ hasText: NAME })
  if (await ours.count()) await ours.first().getByRole('button', { name: /Delete/ }).click()
  await page.waitForLoadState('load'); await state('after cleanup')
}
await browser.close()

