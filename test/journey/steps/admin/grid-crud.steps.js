import { Given, When, Then, test } from '../../support/fixtures.js'
import { holdLock } from '../../support/lock.js'
import { openCrudPage, addRecord, renameRecord, removeRecord, searchRecords, gridRowCount } from '../../flows/grid-crud.flow.js'
import { expectCrudPage, expectRecordListed, expectRecordAbsent, expectRequiredBlocked, expectNoRecordsShown, expectRecordShown, expectDialogMessage } from '../../assertions/grid-crud.assertions.js'

export { test }

/** Per-test names created by the scenario, removed again in cleanup. */
const created = new WeakMap()
const dialogs = new WeakMap()
const rows = new WeakMap()

const track = (page, name) => created.set(page, [...(created.get(page) ?? []), name])

Given('an admin opens the editable list {string}', async ({ page, cleanup }, key) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-data', cleanup) // lists passed alone but failed side by side, so every admin edit takes its turn
  const messages = []
  dialogs.set(page, messages)
  page.on('dialog', (dialog) => { messages.push(dialog.message()) }) // source: app/ProficiencyTestingWeb/Admin/ManageCountries.aspx.vb:148 (MessageBox alerts)
  await openCrudPage(page, key)
  await expectCrudPage(page, key)
  cleanup(async () => {
    for (const name of created.get(page) ?? []) await removeRecord(page, key, name) // delete what the test created, under either name
  })
})

When('they add the record {string} to {string}', async ({ page, runId }, name, key) => {
  const unique = `${name} ${runId}`.slice(0, 28)
  track(page, unique)
  await addRecord(page, key, unique)
})

When('they add a record with no name to {string}', async ({ page }, key) => {
  rows.set(page, await gridRowCount(page))
  await addRecord(page, key, '')
})

When('they rename the record {string} on {string} to {string}', async ({ page, runId }, name, key, newName) => {
  const from = `${name} ${runId}`.slice(0, 28)
  const to = `${newName} ${runId}`.slice(0, 28)
  created.set(page, (created.get(page) ?? []).map((n) => (n === from ? to : n)))
  await renameRecord(page, key, from, to)
})

When('they remove the record {string} from {string}', async ({ page, runId }, name, key) => {
  const unique = `${name} ${runId}`.slice(0, 28)
  await removeRecord(page, key, unique)
  created.set(page, (created.get(page) ?? []).filter((n) => n !== unique))
})

When('they search {string} for the record {string}', async ({ page, runId }, key, name) => {
  await searchRecords(page, key, `${name} ${runId}`.slice(0, 28))
})

When('they look up {string} in the list {string}', async ({ page }, text, key) => {
  await searchRecords(page, key, text)
})

Then('the record {string} is listed on {string}', async ({ page, runId }, name, key) => {
  await expectRecordListed(page, key, `${name} ${runId}`.slice(0, 28))
})

Then('the record {string} is not listed on {string}', async ({ page, runId }, name, key) => {
  await expectRecordAbsent(page, key, `${name} ${runId}`.slice(0, 28))
})

Then('the search shows the record {string}', async ({ page, runId }, name) => {
  await expectRecordShown(page, `${name} ${runId}`.slice(0, 28))
})

Then('the search shows no record called {string}', async ({ page }, name) => {
  await expectNoRecordsShown(page, name)
})

Then('the add is blocked because the name is required', async ({ page }) => {
  await expectRequiredBlocked(page, rows.get(page))
})

Then('the page warns that the record already exists', async ({ page }) => {
  await expectDialogMessage(dialogs.get(page), /already exists/i)
})
