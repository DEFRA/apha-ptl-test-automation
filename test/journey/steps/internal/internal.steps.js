/* eslint-disable playwright/no-standalone-expect -- playwright-bdd step bodies run inside generated tests; move to *.assertions.js when next edited */
import { Given, When, Then, test, expect } from '../../support/fixtures.js'
import { internal } from '../../content/internal.js'
import { expectInternalPage, crawlSideNavigation } from '../../assertions/internal.assertions.js'

/** Steps stay thin: text and routes live in content/internal.js. Internal steps say "internal" so they never clash with the legacy steps. */

const pageByPath = (path) => {
  const entry = internal.list.find((p) => p.path === path)
  if (!entry) throw new Error(`Unknown internal page ${path}; add it to content/internal.js.`)
  return entry
}

const isAccessDenied = (page, response) =>
  response?.status() === 403 || new URL(page.url()).pathname.toLowerCase() === internal.routes.accessDenied.toLowerCase()

// ---- access (anonymous) ----------------------------------------------------

Given('an internal visitor who is not signed in', async ({ page }) => {
  await page.context().clearCookies()
})

When('the visitor opens the internal page {string}', async ({ page }, path) => {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
})

When('the visitor opens the internal {word} page', async ({ page, state }, key) => {
  const response = await page.goto(internal.routes[key])
  state.status = response?.status()
})

Then('the visitor is sent to the Microsoft sign-in page', async ({ page }) => {
  await page.waitForURL((url) => url.hostname === internal.identityProviderHost, { timeout: 30000 })
})

Then('the internal {word} page is shown', async ({ page, role }, key) => {
  await expectInternalPage(page, { heading: internal.pages[key].heading, role })
})

Then('the response status is {int}', async ({ state }, status) => {
  expect(state.status).toBe(status)
})

// ---- navigation (signed in) -------------------------------------------------

Given('a signed-in internal user', async ({ page }) => {
  await page.goto(internal.routes.home)
  await expectInternalPage(page, { heading: internal.pages.home.heading, scan: false })
})

Then('the internal home page greets the user', async ({ page, role }) => {
  await expectInternalPage(page, { heading: internal.pages.home.heading, role })
  await expect(page.getByText(internal.pages.home.welcome)).toBeVisible()
})

Then('the header shows who is signed in', async ({ page }) => {
  await expect(page.getByRole('navigation', { name: 'Account navigation' })).toContainText('Signed in as:')
})

When('the user follows every side navigation link reachable from home', async ({ page, state }) => {
  await page.goto(internal.routes.home)
  state.crawl = await crawlSideNavigation(page)
})

Then('every visited page loads without an error', async ({ state }) => {
  const { visited, problems } = state.crawl
  expect(visited.length, 'pages visited').toBeGreaterThan(1)
  expect(problems, `pages with problems out of ${visited.length} visited`).toEqual([])
})

When('the user opens the internal page with path {string}', async ({ page, state }, path) => {
  const response = await page.goto(path)
  state.entry = pageByPath(path)
  state.denied = isAccessDenied(page, response)
})

Then('the page shows its heading, or refuses an account without the role', async ({ page, state, role }) => {
  if (state.denied) {
    // The refusal is the specified behaviour for an account outside the page's role (Authorization/PtlPolicies.cs).
    await expectInternalPage(page, { heading: internal.pages.accessDenied.heading, role, scan: false })
    test.info().annotations.push({ type: 'role-gap', description: `${state.entry.path} refused: needs ${state.entry.policy}` })
    return
  }
  await expectInternalPage(page, { heading: state.entry.heading, role })
})

