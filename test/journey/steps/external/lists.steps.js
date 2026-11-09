import { Then, When, test } from '../../support/fixtures.js'
import { holdLock } from '../../support/lock.js'
import { ExternalListPage } from '../../pages/external-list.page.js'
import {
  expectListOrMessage,
  expectMessage,
  expectNoRows,
  expectNoSearchForm,
  expectReferenceEmpty,
  expectSchemeTable,
  expectSearchForm,
  expectTitle
} from '../../assertions/list.assertions.js'
import { homeCards, listContent } from '../../content/site.js'

export { test }

When('they select the home card {string}', async ({ page }, key) => {
  await new ExternalListPage(page).card(homeCards[key]).click() // source: content/site.js homeCards
})

Then('the {string} page has its expected title', async ({ page }, key) => {
  await expectTitle(page, key)
})

Then('the scheme list shows its columns and at least one scheme', async ({ page }) => {
  await expectSchemeTable(new ExternalListPage(page))
})

Then('the {string} message is shown', async ({ page }, key) => {
  await expectMessage(new ExternalListPage(page), key)
})

Then('the {string} search form is shown', async ({ page }, key) => {
  await expectSearchForm(new ExternalListPage(page), key)
})

Then('no search form is shown', async ({ page }) => {
  await expectNoSearchForm(new ExternalListPage(page))
})

When('they enter the unknown distribution reference', async ({ page, cleanup }) => {
  test.setTimeout(1200000)
  await holdLock(page, 'distribution-filter', cleanup) // the server remembers the last search per user
  await new ExternalListPage(page).searchField(listContent.referenceLabel).fill(listContent.unknownReference)
})

When('they select SEARCH', async ({ page, cleanup }) => {
  test.setTimeout(1200000)
  await holdLock(page, 'distribution-filter', cleanup)
  await new ExternalListPage(page).searchButton.click()
})

When('they select SHOW ALL', async ({ page, cleanup }) => {
  test.setTimeout(1200000)
  await holdLock(page, 'distribution-filter', cleanup)
  await new ExternalListPage(page).showAllButton.click()
})

Then('the distribution reference box is empty', async ({ page }) => {
  await expectReferenceEmpty(new ExternalListPage(page))
})

Then('no distribution is listed', async ({ page }) => {
  await expectNoRows(new ExternalListPage(page))
})


Then('the distribution list is shown', async ({ page }) => {
  await expectListOrMessage(new ExternalListPage(page))
})


