import { Given, When, Then, test } from '../../support/fixtures.js'
import { allRoles, applyRoles, snapshotRoles, restoreRoles } from '../../flows/roles.flow.js'
import { expectSectionMenu } from '../../assertions/navigation.assertions.js'
import { expectAccess, expectRowShows } from '../../assertions/sub-functions.assertions.js'
import { baseMenus } from '../../content/menus.js'
import { findRecord, recordRow, savePage } from '../../flows/grid-crud.flow.js'

export { test }

Given('the signed-in admin has every optional role ticked', async ({ page, cleanup }) => {
  test.setTimeout(1800000)
  const original = await snapshotRoles(page)
  cleanup(() => restoreRoles(page, original)) // put back the roles the account had before the test
  await applyRoles(page, allRoles(true))
})

Then('every section menu lists its items plus {string}', async ({ page }, extra) => {
  for (const [section, items] of Object.entries(baseMenus)) {
    await page.goto('/Home.aspx') // source: probe 2026-11-03 Home.aspx
    await page.getByRole('link', { name: section, exact: true }).first().click() // source: probe 2026-11-03 Home.aspx cards
    await page.waitForLoadState('load')
    const wanted = section === 'Manage Contracts' && extra ? `${items};${extra}` : items
    await expectSectionMenu(page, wanted.split(';'))
  }
})

When('they open the page {string}', async ({ page }, route) => {
  await page.context().clearCookies() // the role list is read again when the identity cookie is rebuilt
  await page.goto(route)
})

Then('access to the page is {string}', async ({ page }, outcome) => {
  await expectAccess(page, outcome)
})

Then('the sub menu pages of {string} are {string}', async ({ page }, section, outcome) => {
  await page.context().clearCookies() // the role list is read again when the identity cookie is rebuilt
  await page.goto('/Home.aspx') // source: probe 2026-11-03 Home.aspx
  await page.getByRole('link', { name: section, exact: true }).first().click() // source: probe 2026-11-03 Home.aspx cards
  await page.waitForLoadState('load')
  const hrefs = await page.locator('#subMenu a').evaluateAll((links) => links.map((a) => a.href)) // source: probe 2026-11-03 UL#subMenu
  for (const href of hrefs) {
    await page.goto(href)
    await expectAccess(page, outcome)
  }
})

When('they select the scheme tab {string}', async ({ page }, tab) => {
  await page.getByText(tab, { exact: true }).first().click() // source: probe 2026-11-03 Scheme.aspx tabs
  await page.waitForLoadState('load')
})

When('they change the {string} of the record {string} on {string} to {string}', async ({ page, runId }, field, name, key, value) => {
  const id = { Department: 'TxtDepartment', Email: 'TxtEmail' }[field] // source: app/ProficiencyTestingWeb/Admin/ManageExternalTCs.aspx:28,36
  const unique = `${name} ${runId}`.slice(0, 28)
  if (!(await findRecord(page, key, unique))) throw new Error(`Record ${unique} was not found on ${key}`)
  await recordRow(page, unique).getByRole('link', { name: 'Edit', exact: true }).click()
  await page.waitForLoadState('load')
  await page.locator(`input[id$=${id}]`).first().fill(value)
  await page.locator('table.paleblueborder').getByRole('link', { name: 'Save', exact: true }).first().click() // source: ManageExternalTCs.aspx LinkButtonUpdate
  await page.waitForLoadState('load')
  await savePage(page)
})

Then('the record {string} on {string} shows {string}', async ({ page, runId }, name, key, text) => {
  await expectRowShows(page, key, `${name} ${runId}`.slice(0, 28), text)
})


