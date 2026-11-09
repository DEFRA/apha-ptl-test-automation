import { expect } from '@playwright/test'
import { settingsPages } from '../content/settings.js'
import { openSettings, readField } from '../flows/settings.flow.js'

export async function expectSettingsPage(page, key) {
  await expect(page.getByRole('heading', { level: 1, name: settingsPages[key].heading, exact: true }).first()).toBeVisible() // source: settingsPages in content/settings.js
}

/** Reloads the page so the value comes from the server, not the browser. */
export async function expectStoredValue(page, key, field, expected) {
  await openSettings(page, key)
  await expectSettingsPage(page, key)
  expect(await readField(page, key, field), `${field} on ${key} after reload`).toBe(expected) // source: settingsPages in content/settings.js
}
