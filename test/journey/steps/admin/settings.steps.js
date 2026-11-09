import { Given, When, Then, test } from '../../support/fixtures.js'
import { holdLock } from '../../support/lock.js'
import { openSettings, readField, writeField, commitSettings, cancelSettings } from '../../flows/settings.flow.js'
import { expectSettingsPage, expectStoredValue } from '../../assertions/settings.assertions.js'

export { test }

/** Original values by page, so cleanup can put every changed field back. */
const originals = new WeakMap()
const withRun = (value, runId) => value.replace('RUN', runId)

Given('an admin opens the {string} settings page', async ({ page, cleanup }, key) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-data', cleanup) // shares the lock of the editable lists: admin edits passed alone but failed side by side
  await openSettings(page, key)
  await expectSettingsPage(page, key)
  originals.set(page, new Map())
  cleanup(async () => {
    for (const [field, value] of originals.get(page)) {
      await openSettings(page, key)
      await writeField(page, key, field, value)
      await commitSettings(page, key)
    }
  })
})

When('they set the {string} field of the {string} settings page to {string}', async ({ page, runId }, field, key, value) => {
  const saved = originals.get(page)
  if (!saved.has(field)) saved.set(field, await readField(page, key, field))
  await writeField(page, key, field, withRun(value, runId))
})

When('they save the {string} settings page', async ({ page }, key) => {
  await commitSettings(page, key)
})

When('they cancel the {string} settings page', async ({ page }, key) => {
  await cancelSettings(page, key)
})

Then('the {string} field of the {string} settings page shows {string} after reloading', async ({ page, runId }, field, key, value) => {
  await expectStoredValue(page, key, field, withRun(value, runId))
})

Then('the {string} field of the {string} settings page shows its original value after reloading', async ({ page }, field, key) => {
  await expectStoredValue(page, key, field, originals.get(page).get(field))
})
