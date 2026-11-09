import { Given, When, Then, test } from '../../support/fixtures.js'
import { AdminListPage, AdminSearchPage } from '../../pages/admin-lists.page.js'
import {
  expectBoxAndButton,
  expectColumns,
  expectCustomerSearchFields,
  expectLinks,
  expectNoResults,
  expectResultText,
  expectRows,
  expectSeededScheme,
  expectSomeResults,
  expectStatusOptions,
  expectTabs
} from '../../assertions/admin-lists.assertions.js'
import { adminLists, adminPages, adminSearch } from '../../content/site.js'

export { test }

When('they search {string} for {string}', async ({ page }, target, value) => {
  const search = new AdminSearchPage(page)
  await search.box(target).fill(value)
  await search.button(target).click()
  await page.waitForLoadState('load')
})

Then('the search shows no results', async ({ page }) => {
  await expectNoResults(new AdminSearchPage(page))
})

Then('the search shows some results', async ({ page }) => {
  await expectSomeResults(new AdminSearchPage(page))
})

Then('the search results include {string}', async ({ page }, text) => {
  await expectResultText(new AdminSearchPage(page), text)
})

Then('the {string} search shows its box and button', async ({ page }, target) => {
  await expectBoxAndButton(new AdminSearchPage(page), target)
})

Then('the distribution search tabs are shown', async ({ page }) => {
  await expectTabs(new AdminSearchPage(page), adminSearch.distributionTabs)
})

Then('the contracts search tabs and customer fields are shown', async ({ page }) => {
  const search = new AdminSearchPage(page)
  await expectTabs(search, adminSearch.contractsTabs)
  await expectCustomerSearchFields(search)
})

Then('the user search instruction is shown', async ({ page }) => {
  await expectResultText(new AdminSearchPage(page), adminSearch.userInstruction)
})

Then('the customers list shows its columns, links and filter options', async ({ page }) => {
  const list = new AdminListPage(page)
  await expectColumns(list, adminLists.customerColumns)
  await expectLinks(list, adminLists.customerLinks)
  await expectStatusOptions(list)
})

When('they filter customers by {string}', async ({ page }, status) => {
  const list = new AdminListPage(page)
  await list.statusSelect.selectOption({ label: status })
  await list.filterButton.click()
})

Then('the customers table has its columns and at least one row', async ({ page }) => {
  const list = new AdminListPage(page)
  await expectColumns(list, adminLists.customerColumns)
  await expectRows(list)
})

When('they select the list link {string}', async ({ page }, name) => {
  await new AdminListPage(page).link(name).click()
})

Then('the schemes list shows its columns and links', async ({ page }) => {
  const list = new AdminListPage(page)
  await expectColumns(list, adminLists.schemeColumns)
  await expectLinks(list, adminLists.schemeLinks)
})

Then('the seeded scheme row is shown', async ({ page }) => {
  await expectSeededScheme(new AdminListPage(page))
})

Given('an admin returns to the schemes list', async ({ page }) => {
  await page.goto(adminPages.schemes.route) // source: docs/discovery/crawl-admin.json /Scheme Admin/SchemeList.aspx
})
