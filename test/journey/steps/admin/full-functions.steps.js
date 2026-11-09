import { When, Then, test } from '../../support/fixtures.js'
import { holdLock } from '../../support/lock.js'
import { requestExport, searchDirectory, createFoundUser, removeUserByLabel, fillNewScheme, saveScheme, setNotes, readNotes, renewPricingPlan } from '../../flows/full-functions.flow.js'
import { expectOnRoute, expectDownloaded, expectUserButton, expectYearListed, expectNotes } from '../../assertions/full-functions.assertions.js'
import { schemeCreate } from '../../content/full-functions.js'

export { test }

const state = new WeakMap()
const mine = (page) => { if (!state.has(page)) state.set(page, {}); return state.get(page) }

Then('the browser is on {string} without a server error', async ({ page }, route) => {
  await expectOnRoute(page, route)
})

When('they request the export {string}', async ({ page }, name) => {
  mine(page).download = await requestExport(page, name)
})

Then('the export is answered without a server error', async ({ page }) => {
  await mine(page).download
  await expectOnRoute(page, decodeURIComponent(new URL(page.url()).pathname)) // the export may download a file or open a page
})

Then('the export file is downloaded', async ({ page }) => {
  expectDownloaded(await mine(page).download)
})

When('they search the directory for the configured user', async ({ page }) => {
  await searchDirectory(page)
})

When('they create the found user', async ({ page, cleanup }) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-full', cleanup)
  const label = await createFoundUser(page)
  mine(page).user = label
  cleanup(async () => { await removeUserByLabel(page, label).catch(() => {}) }) // do not leave the user behind
})

Then('the user is created and Setup Roles is offered', async ({ page }) => {
  await expectUserButton(page, 'Setup Roles')
})

When('they remove the created user', async ({ page }) => {
  await removeUserByLabel(page, mine(page).user)
})

Then('the user is removed and Remove Another is offered', async ({ page }) => {
  await expectUserButton(page, 'Remove Another')
})

When('they start a scheme for the current year', async ({ page }) => {
  await page.getByRole('link', { name: schemeCreate.createLink, exact: true }).click() // source: probe 2026-11-03 /Scheme Admin/SchemeList.aspx
  await page.waitForLoadState('load')
})

When('they fill the new scheme with a unique identifier', async ({ page, runId }) => {
  await fillNewScheme(page, runId)
})

When('they save the scheme', async ({ page, cleanup }) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-full', cleanup)
  await saveScheme(page)
})

When('they open the first customer for editing', async ({ page }) => {
  await page.getByRole('link', { name: 'Details', exact: true }).first().click() // source: probe 2026-11-03 /Contracts Admin/CustomerList.aspx
  await page.waitForURL(/Customer\.aspx/)
})

When('they change the customer notes to a unique value', async ({ page, runId, cleanup }) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-full', cleanup)
  const original = await readNotes(page)
  mine(page).notes = { original, value: `E2E notes ${runId}`.slice(0, 40) }
  cleanup(async () => { await page.reload(); await setNotes(page, original) }) // put the original notes back
  await setNotes(page, mine(page).notes.value)
})

Then('the customer notes show the new value after reloading', async ({ page }) => {
  await page.reload()
  expectNotes(await readNotes(page), mine(page).notes.value)
})

When('they renew the {string} pricing plan', async ({ page, cleanup }, key) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-full', cleanup)
  page.on('dialog', (dialog) => dialog.accept()) // source: renew asks for confirmation
  mine(page).year = await renewPricingPlan(page, key)
})

Then('the {string} pricing plan lists the renewed financial year', async ({ page }, key) => {
  await expectYearListed(page, key, mine(page).year)
})
