import { Given, When, Then, test } from '../../support/fixtures.js'
import { expectPageLoaded } from '../../assertions/page.assertions.js'
import {
  expectActionCards,
  expectHeaderDetails,
  expectHomeSections,
  expectNoServerError,
  expectStatus
} from '../../assertions/site.assertions.js'
import { ExternalHomePage } from '../../pages/external-home.page.js'
import { externalPages, homeContent, unknownExternalRoute } from '../../content/site.js'

export { test }

/** Response of the last unknown-route request, per page. */
const unknownResponses = new WeakMap()

Given('a signed-in customer opens the {string} page', async ({ page, role }, key) => {
  await page.goto(externalPages[key].route) // source: content/site.js externalPages
  await expectPageLoaded(page, { heading: externalPages[key].heading, role })
})

When('they reload the page', async ({ page }) => {
  await page.reload()
})

When('they use the browser Back button', async ({ page }) => {
  await page.goBack()
})

Then('the {string} page is shown', async ({ page, role }, key) => {
  await expectPageLoaded(page, { heading: externalPages[key].heading, role })
})

Then('no server error page is shown', async ({ page }) => {
  await expectNoServerError(page)
})

Then('the home sections are shown in order', async ({ page }) => {
  await expectHomeSections(new ExternalHomePage(page))
})

Then('the nine action cards are shown', async ({ page }) => {
  await expectActionCards(new ExternalHomePage(page))
})

Then('the header shows the signed-in user name and the header links', async ({ page }) => {
  await expectHeaderDetails(new ExternalHomePage(page))
})

When('they select the home page link {string}', async ({ page }, key) => {
  await new ExternalHomePage(page).link(homeContent.links[key]).click()
})

When('they open an unknown page', async ({ page }) => {
  unknownResponses.set(page, await page.goto(unknownExternalRoute)) // source: content/site.js unknownExternalRoute
})

Then('the server responds with status {int}', async ({ page }, status) => {
  expectStatus(unknownResponses.get(page), status)
})
