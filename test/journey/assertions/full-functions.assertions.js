import { expect } from '@playwright/test'
import { stripBasePath } from '../support/base-path.js'
import { pricingRenew } from '../content/full-functions.js'

export async function expectOnRoute(page, route) {
  await expect.poll(() => stripBasePath(decodeURIComponent(new URL(page.url()).pathname), process.env.PROFICIENCY_TESTING_WEB_URL).toLowerCase()).toBe(stripBasePath(route, process.env.PROFICIENCY_TESTING_WEB_URL).toLowerCase()) // source: probe 2026-11-03 list links
  await expect(page.getByText('Server Error in')).toHaveCount(0) // source: ASP.NET error page text
}

export function expectDownloaded(download) {
  expect(download.suggestedFilename().length).toBeGreaterThan(0) // source: Playwright download event
}

export async function expectUserButton(page, name) {
  await expect(page.getByRole('button', { name })).toBeVisible() // source: UserCreate.aspx Button_SetupRoles, UserDelete.aspx Button_DeleteAnother
}

export async function expectYearListed(page, key, year) {
  await expect(page.locator(pricingRenew[key].year).locator('option', { hasText: year })).toHaveCount(1) // source: ddlYear lists every financial year
}

export function expectNotes(actual, expected) {
  expect(actual).toBe(expected) // source: Customer.aspx TextboxNotes
}

export async function expectNoServerError(page) {
  await expect(page.getByText('Server Error in')).toHaveCount(0) // source: ASP.NET error page text
}

