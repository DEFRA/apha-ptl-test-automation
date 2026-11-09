import { Given, Then } from '../../support/fixtures.js'
import { expectPageLoaded } from '../../assertions/page.assertions.js'
import { pages, routes } from '../../content/routes.js'

/**
 * Steps stay thin: they call a flow, a page object or a client. No locators, no URLs and no
 * visible text here, or the same step stops working after the GDS migration.
 */

Given('the applicant is on the start page', async ({ page }) => {
  await page.goto(routes.start)
})

Then('the start page is shown', async ({ page, role }) => {
  await expectPageLoaded(page, { heading: pages.start.heading, role })
})
