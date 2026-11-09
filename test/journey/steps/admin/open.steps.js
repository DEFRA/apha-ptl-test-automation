import { When, Then, test } from '../../support/fixtures.js'
import { expectPageText } from '../../assertions/admin-open.assertions.js'

export { test }

When('they open the search result {string}', async ({ page }, _text) => {
  await page.getByRole('link', { name: 'Details', exact: true }).first().click() // source: probe 2026-11-02 /Contracts Admin/Search.aspx results Details link
  await page.waitForURL((url) => !url.pathname.endsWith('/Search.aspx')) // source: probe 2026-11-03 Details postback navigates away from Search.aspx
  await page.waitForLoadState('load')
})

Then('the page shows the text {string}', async ({ page }, text) => {
  await expectPageText(page, text) // source: app/ProficiencyTestingWeb/Contracts Admin/CustomerDetails.aspx
})

