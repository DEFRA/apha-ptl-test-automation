import { Given, When, Then, test } from '../../support/fixtures.js'
import { expectCards, expectSectionMenu, expectOpened, expectRoleState } from '../../assertions/navigation.assertions.js'
import { optionalRoles, setOwnRole, roleIsTicked, openRoles, snapshotRoles, restoreRoles, applyRoles, allRoles } from '../../flows/roles.flow.js'
import { baseMenus as BASE } from '../../content/menus.js'

export { test }


Then('the home page lists the section cards {string}', async ({ page }, names) => {
  await expectCards(page, names.split(';'))
})

When('they open the {string} section from Home', async ({ page }, name) => {
  await page.getByRole('link', { name, exact: true }).first().click() // source: probe 2026-11-03 Home.aspx cards
  await page.waitForLoadState('load')
})

When('they open Home and the {string} section', async ({ page }, name) => {
  await page.context().clearCookies() // the role list is read again when the identity cookie is rebuilt at the next request
  await page.goto('/Home.aspx') // source: probe 2026-11-03 Home.aspx
  await page.getByRole('link', { name, exact: true }).first().click() // source: probe 2026-11-03 Home.aspx cards
  await page.waitForLoadState('load')
})

When('they select the menu item {string}', async ({ page }, item) => {
  await page.locator('#subMenu').getByRole('link', { name: item, exact: true }).click() // source: probe 2026-11-03 UL#subMenu
  await page.waitForLoadState('load')
})

Then('the section menu lists {string}', async ({ page }, items) => {
  await expectSectionMenu(page, items.split(';'))
})

Then('the page opens at {string} with the heading {string}', async ({ page }, route, heading) => {
  await expectOpened(page, route, heading)
})

Given('the signed-in admin has only the Admin role', async ({ page, cleanup }) => {
  test.setTimeout(600000)
  const original = await snapshotRoles(page)
  cleanup(() => restoreRoles(page, original)) // put back the roles the account had before the test
  await applyRoles(page, allRoles(false))
  await openRoles(page)
  for (const role of optionalRoles) await expectRoleState(await roleIsTicked(page, role), false) // source: probe 2026-11-03 own row has only Admin ticked
})

When('they tick the role {string} for themselves', async ({ page }, role) => {
  await setOwnRole(page, role, true)
  await openRoles(page)
  await expectRoleState(await roleIsTicked(page, role), true) // the change is saved: a fresh load of Manage Roles shows it
})

When('they untick the role {string} for themselves', async ({ page }, role) => {
  await setOwnRole(page, role, false)
})

Then('every section menu still lists its items', async ({ page }) => {
  for (const [section, items] of Object.entries(BASE)) {
    await page.goto('/Home.aspx') // source: probe 2026-11-03 Home.aspx
    await page.getByRole('link', { name: section, exact: true }).first().click() // source: probe 2026-11-03 Home.aspx cards
    await page.waitForLoadState('load')
    await expectSectionMenu(page, items.split(';'))
  }
})



