import { When, Then, Given, test } from '../../support/fixtures.js'
import { holdLock } from '../../support/lock.js'
import { distributionListRoutes } from '../../content/site.js'
import { ExternalListPage } from '../../pages/external-list.page.js'
import { expectListRow, expectListCode, expectViewPage, expectViewButtons } from '../../assertions/distribution-data.assertions.js'

export { test }

Given('the customer opens the clean distribution list {string}', async ({ page, cleanup }, key) => {
  test.setTimeout(1200000)
  await holdLock(page, 'distribution-filter', cleanup) // the server remembers the last search per user, so these tests must not overlap
  await page.goto(distributionListRoutes[key]) // source: probe 2026-11-03 DistributionsPrevious.aspx / Tabulations.aspx
  await new ExternalListPage(page).showAllButton.click() // source: crawl http://localhost:1688/Tabulations.aspx buttons
  await page.waitForLoadState('load')
})

When('they search the list for the distribution reference {string}', async ({ page }, reference) => {
  const list = new ExternalListPage(page)
  await list.searchField('Scheme Code').fill('') // source: crawl http://localhost:1688/DistributionsPrevious.aspx labels
  await list.searchField('Scheme Name').fill('') // source: crawl http://localhost:1688/DistributionsPrevious.aspx labels
  await list.searchField('Distribution Reference').fill(reference) // source: crawl http://localhost:1688/DistributionsPrevious.aspx labels
  await list.searchButton.click()
  await page.waitForLoadState('load')
})

When('they search the list for the scheme code {string}', async ({ page }, code) => {
  const list = new ExternalListPage(page)
  await list.searchField('Distribution Reference').fill('') // source: crawl http://localhost:1688/DistributionsPrevious.aspx labels
  await list.searchField('Scheme Name').fill('') // source: crawl http://localhost:1688/DistributionsPrevious.aspx labels
  await list.searchField('Scheme Code').fill(code) // source: crawl http://localhost:1688/DistributionsPrevious.aspx labels
  await list.searchButton.click()
  await page.waitForLoadState('load')
})

When('they open the {string} link of the row {string}', async ({ page }, link, reference) => {
  test.slow() // the results and report pages render large tables
  await new ExternalListPage(page).dataRows.filter({ hasText: reference }).first().locator('a').filter({ hasText: link }).first().click() // source: probe 2026-11-02 DistributionsPrevious.aspx View links
  await page.waitForLoadState('load')
})

When('they open the {string} link of the first row', async ({ page }, link) => {
  await new ExternalListPage(page).dataRows.first().locator('a').filter({ hasText: link }).first().click() // source: probe 2026-11-02 DistributionsPrevious.aspx View links
  await page.waitForLoadState('load')
})

When('they select BACK', async ({ page }) => {
  await page.getByRole('button', { name: 'BACK', exact: true }).click() // source: probe 2026-11-02 ResultsView.aspx buttons
  await page.waitForLoadState('load')
})

Then('the list shows a row with {string} and {string}', async ({ page }, reference, code) => {
  await expectListRow(new ExternalListPage(page), reference, code)
})

Then('the list shows a row with the scheme code {string}', async ({ page }, code) => {
  await expectListCode(new ExternalListPage(page), code)
})

Then('the page heading is {string} and it shows {string}', async ({ page }, heading, text) => {
  await expectViewPage(page, heading, text)
})

Then('the report shows the buttons {string} and {string}', async ({ page }, first, second) => {
  await expectViewButtons(page, [first, second])
})



