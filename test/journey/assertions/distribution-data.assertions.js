import { expect } from '@playwright/test'

export async function expectListRow(list, reference, code) {
  await expect(list.dataRows.filter({ hasText: reference }).filter({ hasText: code }).first()).toBeVisible() // source: probe 2026-11-02 DistributionsPrevious.aspx rows
}

export async function expectViewPage(page, heading, text) {
  await expect(page.getByRole('heading', { level: 1, name: heading, exact: true }).first()).toBeVisible() // source: probe 2026-11-02 ResultsView.aspx / TabulationView.aspx h1
  await expect(page.locator('body')).toContainText(text) // source: probe 2026-11-02 ResultsView.aspx text
}

export async function expectViewButtons(page, names) {
  for (const name of names) await expect(page.getByRole('button', { name, exact: true })).toBeVisible() // source: probe 2026-11-02 TabulationView.aspx buttons
}

export async function expectListCode(list, code) {
  await expect(list.dataRows.filter({ hasText: code }).first()).toBeVisible() // source: probe 2026-11-02 DistributionsPrevious.aspx rows
}
