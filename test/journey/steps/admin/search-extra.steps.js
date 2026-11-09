import { When, Then } from '../../support/fixtures.js'
import { expectMaxLength } from '../../assertions/admin-search-extra.assertions.js'
import { AdminSearchPage } from '../../pages/admin-lists.page.js'

When('they open the first tabulation waiting for sign-off', async ({ page }) => {
  await page.getByTitle('Show/Hide Samples').first().click() // source: probe 2026-11-03 /Results Sign-off/SignOff.aspx rows start collapsed
  await page.locator('a[href*="Tabulation.aspx?TabulationId"]:visible').first().click() // source: probe 2026-11-03 /Results Sign-off/SignOff.aspx View links
  await page.waitForURL(/Tabulation\.aspx/) // source: probe 2026-11-03 /Results Sign-off/SignOff.aspx View links
})

When('they open the {string} search tab', async ({ page }, name) => {
  const tab = page.getByRole('link', { name, exact: true }).or(page.locator('.ajax__tab_tab').filter({ hasText: name })).first() // source: probe 2026-11-03 /Distributions/Search.aspx tab links; Contracts Admin/Search.aspx uses AjaxControlToolkit tabs (TablPanelParticipant)
  await tab.click()
  await page.waitForLoadState('load')
})

Then('the {string} search box accepts at most {int} characters', async ({ page }, target, max) => {
  await expectMaxLength(new AdminSearchPage(page).box(target), max)
})

