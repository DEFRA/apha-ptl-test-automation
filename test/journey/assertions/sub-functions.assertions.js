import { expect } from '@playwright/test'
import { accessDeniedText } from '../content/menus.js'
import { findRecord, recordRow, openCrudPage } from '../flows/grid-crud.flow.js'

export async function expectAccess(page, outcome) {
  const denied = page.getByText(accessDeniedText)
  if (outcome === 'denied') await expect(denied).toBeVisible() // source: probe 2026-11-03 Access Denied page
  else await expect(denied).toHaveCount(0)
}

export async function expectRowShows(page, key, unique, text) {
  await openCrudPage(page, key)
  await expect.poll(async () => (await findRecord(page, key, unique)) && (await recordRow(page, unique).innerText())).toContain(text) // source: ManageExternalTCs.aspx row labels
}
