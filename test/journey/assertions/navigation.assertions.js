import { expect } from '@playwright/test'

export async function expectCards(page, names) {
  const links = page.locator('a[href*="Menu"], a[href*="Results"]') // source: probe 2026-11-03 Home.aspx cards
  for (const name of names) await expect(page.getByRole('link', { name, exact: true }).first()).toBeVisible() // source: probe 2026-11-03 Home.aspx cards
  await expect(links.first()).toBeVisible() // source: probe 2026-11-03 Home.aspx cards
}

export async function expectSectionMenu(page, items) {
  await expect.poll(async () => (await page.locator('#subMenu a').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim())).toEqual(items) // source: probe 2026-11-03 UL#subMenu
}

export async function expectOpened(page, route, heading) {
  await expect(page).toHaveURL(new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '(?: |%20)') + '$', 'i')) // source: data/nav-items.json
  await expect(page.getByRole('heading', { level: 1, name: heading, exact: true }).first()).toBeVisible() // source: data/nav-items.json
}

export async function expectRoleState(ticked, expected) {
  expect(ticked).toBe(expected) // source: app/ProficiencyTestingWeb/Admin/UserRoles.aspx
}
