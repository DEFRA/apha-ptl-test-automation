import { expect } from '@playwright/test'
import { scanPage } from '../support/a11y.js'
import { textPattern } from '../support/text.js'

/**
 * The one way a step confirms it has landed on a page. It asserts the h1 (page identity,
 * never the URL) and runs the deduplicated axe scan.
 *
 * Passing `role` or `variant` changes the scan key, so a page that differs by role or state
 * is genuinely scanned again instead of being skipped as a duplicate.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ heading: string, variant?: 'default'|'error'|'confirmation'|'empty'|'modal', role?: string }} options
 */
export async function expectPageLoaded(page, { heading, variant = 'default', role = 'anonymous' }) {
  // .first(): some legacy pages render more than one h1 (e.g. My account); the first is the page identity.
  await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(textPattern(heading))
  await scanPage(page, { variant, role })
}

/**
 * Assert an inline field error by meaning, tolerating the GOV.UK visually hidden prefix.
 * @param {import('@playwright/test').Locator} locator
 * @param {string} message
 */
export async function expectFieldError(locator, message) {
  await expect(locator).toBeVisible()
  await expect(locator).toHaveText(textPattern(message))
}
