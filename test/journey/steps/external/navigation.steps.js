import { Given, When, Then, test } from '../../support/fixtures.js'
import { expectPageLoaded } from '../../assertions/page.assertions.js'
import { SiteChromePage } from '../../pages/site-chrome.page.js'
import { footerLinks, navigationHeadings, navigationRoutes } from '../../content/navigation.js'

export { test }

Given('a signed-in customer is on the Help page', async ({ page, role }) => {
  await page.goto(navigationRoutes.help) // source: app/ProficiencyTestingExternalWeb/Footer.ascx:12
  await expectPageLoaded(page, { heading: navigationHeadings.help, role })
})

Given('a signed-in customer is on the home page', async ({ page, role }) => {
  await page.goto(navigationRoutes.home) // source: app/ProficiencyTestingExternalWeb/NavigationBar.ascx:43
  await expectPageLoaded(page, { heading: navigationHeadings.home, role })
})

When('they select the logo', async ({ page }) => {
  await new SiteChromePage(page).logo.click()
})

Then('the home page is shown', async ({ page, role }) => {
  await expectPageLoaded(page, { heading: navigationHeadings.home, role })
})

When('they select the {string} footer link', async ({ page }, key) => {
  await new SiteChromePage(page).footerLink(key).click()
})

Then('the {string} footer destination is shown', async ({ page, role }, key) => {
  await expectPageLoaded(page, { heading: footerLinks[key].heading, role })
})

When('they go back to the home page', async ({ page }) => {
  await page.goBack()
})
