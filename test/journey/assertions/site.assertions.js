import { expect } from '@playwright/test'
import { adminHelpHref, adminHomeLinks, homeContent } from '../content/site.js'

export async function expectNoServerError(page) {
  await expect(page.locator('body')).not.toContainText('Server Error in')
}

export async function expectHomeSections(home) {
  await expect(home.sectionHeadings).toHaveText(homeContent.sections)
}

export async function expectActionCards(home) {
  await expect(home.cardHeadings).toHaveCount(homeContent.cards.length)
  await expect(home.cardHeadings).toHaveText(homeContent.cards)
}

export async function expectHeaderDetails(home) {
  await expect(home.loggedInLabel).toBeVisible()
  await expect(home.userName).toBeVisible()
  for (const name of homeContent.headerLinks) await expect(home.link(name)).toBeVisible()
  await expect(home.logOut).toBeVisible()
}

export function expectStatus(response, status) {
  expect(response.status()).toBe(status)
}

export async function expectAdminMenuLinks(home) {
  for (const name of adminHomeLinks) await expect(home.menuLink(name)).toBeVisible()
}

export async function expectAdminHelpHref(home) {
  await expect(home.menuLink('Help')).toHaveAttribute('href', adminHelpHref)
}
