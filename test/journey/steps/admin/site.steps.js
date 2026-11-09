import { Given, When, Then, test } from '../../support/fixtures.js'
import { expectPageLoaded } from '../../assertions/page.assertions.js'
import { expectAdminHelpHref, expectAdminMenuLinks, expectNoServerError } from '../../assertions/site.assertions.js'
import { AdminHomePage } from '../../pages/admin-home.page.js'
import { adminPages } from '../../content/site.js'

export { test }

Given('an admin opens the {string} admin page', async ({ page, role }, key) => {
  await page.goto(adminPages[key].route) // source: content/site.js adminPages
  await expectPageLoaded(page, { heading: adminPages[key].heading, role })
})

When('they reload the admin page', async ({ page }) => {
  await page.reload()
})

When('they use the admin browser Back button', async ({ page }) => {
  await page.goBack()
})

Then('the {string} admin page is shown', async ({ page, role }, key) => {
  await expectPageLoaded(page, { heading: adminPages[key].heading, role })
})

Then('no admin server error page is shown', async ({ page }) => {
  await expectNoServerError(page)
})

Then('the admin home page shows the menu links', async ({ page }) => {
  await expectAdminMenuLinks(new AdminHomePage(page))
})

When('they select the admin menu link for {string}', async ({ page }, key) => {
  await new AdminHomePage(page).menuLink(adminPages[key].link).click()
})

Then('the admin Help link points to the quick reference guide', async ({ page }) => {
  await expectAdminHelpHref(new AdminHomePage(page))
})
