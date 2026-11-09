import { settingsPages } from '../content/settings.js'

const postbackAfter = async (page, action) => {
  const posted = page.waitForResponse((r) => r.request().method() === 'POST', { timeout: 15000 }).catch(() => null)
  await action()
  await posted
  await page.waitForLoadState('networkidle')
}

export async function openSettings(page, key) {
  await page.waitForLoadState('networkidle').catch(() => {}) // a save can still be redirecting
  const go = () => page.goto(settingsPages[key].route) // source: settingsPages in content/settings.js
  await go().catch(async (error) => {
    if (!/interrupted by another navigation/.test(String(error))) throw error
    await page.waitForLoadState('load') // a redirect after Cancel overlapped the request
    await go()
  })
}

const rowLink = (page, name) => page.locator('table.paleblueborder').getByRole('link', { name, exact: true }).first() // source: probe 2026-11-03 grid row links

/** Row-edit pages show the box only after Edit is pressed on the first row. */
async function prepare(page, key) {
  if (settingsPages[key].kind === 'rowEdit') await postbackAfter(page, () => rowLink(page, 'Edit').click()) // source: PostagePricingPlan.aspx LinkButtonEdit
}

async function fieldBox(page, key, field) {
  const config = settingsPages[key]
  if (config.kind === 'grid') {
    const headers = await page.locator('table.paleblueborder th').allInnerTexts() // source: probe 2026-11-03 column headers
    const index = headers.findIndex((h) => h.includes(config.fields[field]))
    return page.locator('table.paleblueborder tr').nth(1).locator('td').nth(index).locator('input[type=text]') // source: AdministrationChargeCurrency.aspx.vb SetupGridView
  }
  return page.locator(`input[id$=${config.fields[field]}]`).first() // source: settingsPages in content/settings.js
}

export async function readField(page, key, field) {
  await prepare(page, key)
  const value = await (await fieldBox(page, key, field)).inputValue()
  if (settingsPages[key].kind === 'rowEdit') await postbackAfter(page, () => rowLink(page, 'Cancel').click()) // source: PostagePricingPlan.aspx LinkButtonCancel
  return value
}

export async function writeField(page, key, field, value) {
  await prepare(page, key)
  const box = await fieldBox(page, key, field)
  await box.fill(value)
}

export async function commitSettings(page, key) {
  const config = settingsPages[key]
  if (config.kind === 'form' || config.kind === 'grid') await postbackAfter(page, () => page.locator(`input[id$=${config.commit}]`).click()) // source: settingsPages in content/settings.js
  else if (config.kind === 'rowEdit') {
    await postbackAfter(page, () => rowLink(page, 'Save').click()) // source: PostagePricingPlan.aspx LinkButtonUpdate
    if (config.pageSave) await postbackAfter(page, () => page.locator(`input[id$=${config.pageSave}]`).click()) // source: settingsPages in content/settings.js
  }
}

export async function cancelSettings(page, key) {
  const config = settingsPages[key]
  if (config.kind === 'form') await postbackAfter(page, () => page.locator(`input[id$=${config.cancel}]`).click()) // source: settingsPages in content/settings.js
  else if (config.kind === 'rowEdit') await postbackAfter(page, () => rowLink(page, 'Cancel').click()) // source: PostagePricingPlan.aspx LinkButtonCancel
}
