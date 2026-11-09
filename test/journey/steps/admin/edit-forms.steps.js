import { Given, When, Then, test } from '../../support/fixtures.js'
import { holdLock } from '../../support/lock.js'
import { openFirstRecord, setField, readField, saveRecord, attemptSave, copyContactToInvoice, addFirstViewer, removeAllAddedViewers, saveViewers, selectedViewerCount, firstConsultant, toggleConsultant, consultantStatus, readEditors, writeEditor, saveExternalSite } from '../../flows/edit-forms.flow.js'
import { fillRequiredCustomerFields, openCreateCustomer, saveCustomer, makeCustomerInactive } from '../../flows/customer-create.flow.js'
import { expectFieldEquals, expectValidationBlocked, expectNotEmpty, expectDifferent, expectMore } from '../../assertions/edit-forms.assertions.js'
import { editForms } from '../../content/edit-forms.js'

export { test }

const state = new WeakMap()
const mine = (page) => { if (!state.has(page)) state.set(page, { originals: new Map() }); return state.get(page) }
const withRun = (value, runId) => value.replace('RUN', runId.replace(/\W/g, '').slice(0, 8))

Given('an admin opens the first {string} record for editing', async ({ page, cleanup }, kind) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-full', cleanup)
  await openFirstRecord(page, kind)
  mine(page).url = page.url() // saving a participant, contract or scheme returns to its list, so reopen the record by address
  cleanup(async () => { // put every changed field back
    const saved = mine(page).originals
    if (saved.size === 0) return
    await page.goto(mine(page).url)
    for (const [id, value] of saved) await setField(page, id, value)
    await saveRecord(page)
  })
})

When('they set the field {string} to {string}', async ({ page, runId }, id, value) => {
  const saved = mine(page).originals
  if (!saved.has(id)) saved.set(id, await readField(page, id))
  await setField(page, id, withRun(value, runId))
})

When('they save the record', async ({ page }) => {
  await saveRecord(page)
})

When('they try to save the record', async ({ page }) => {
  await attemptSave(page)
})

Then('the field {string} shows {string} after reloading', async ({ page, runId }, id, value) => {
  await page.goto(mine(page).url)
  await expectFieldEquals(await readField(page, id), withRun(value, runId))
})

Then('saving is blocked by validation', async ({ page }) => {
  await expectValidationBlocked(page)
})

Given('an admin has filled the create customer form', async ({ page, runId, cleanup }) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-full', cleanup)
  page.on('dialog', (dialog) => dialog.accept()) // source: Customer.aspx.vb:293 MessageBox alert
  await openCreateCustomer(page)
  await fillRequiredCustomerFields(page, `E2E Edit ${runId}`.slice(0, 40))
  cleanup(async () => { await makeCustomerInactive(page).catch(() => {}) })
})

When('they copy the customer contact details to the invoice details', async ({ page }) => {
  await copyContactToInvoice(page)
})

Then('the invoice email equals the contact email', async ({ page }) => {
  await expectFieldEquals(await readField(page, editForms.customer.invoiceEmail), await readField(page, editForms.customer.contactEmail))
})

When('they save the new customer', async ({ page }) => {
  await saveCustomer(page)
})

When('they untick Active and save the customer', async ({ page }) => {
  await page.locator(`[id$=${editForms.customer.active}]`).first().uncheck()
  await page.waitForLoadState('load')
  await saveCustomer(page)
})

Then('the customer shows an inactive date', async ({ page }) => {
  expectNotEmpty(await readField(page, editForms.customer.inactiveDate))
})

When('they add the first possible viewer to the participant', async ({ page, cleanup }) => {
  const before = await addFirstViewer(page)
  mine(page).viewersBefore = before
  cleanup(async () => { await removeAllAddedViewers(page, before) })
  await saveViewers(page)
})

Then('the participant has one more viewer', async ({ page }) => {
  await page.getByRole('link', { name: 'Viewers', exact: true }).first().click() // Save returns to the participant list, so open the viewers again
  await page.waitForLoadState('load')
  expectMore(await selectedViewerCount(page), mine(page).viewersBefore)
})

When('they toggle the first consultant status', async ({ page, cleanup }) => {
  page.on('dialog', (dialog) => dialog.accept()) // source: TCDepartment.aspx.vb shows an alert when the consultant is linked to schemes
  await holdLock(page, 'admin-full', cleanup)
  const { user, status } = await firstConsultant(page)
  mine(page).consultant = { user, status }
  cleanup(async () => {
    await page.goto('/Admin/TCDepartment.aspx') // source: content/site.js adminPages.tcDepartment
    if ((await consultantStatus(page, user)) !== status) await toggleConsultant(page, user)
  })
  await toggleConsultant(page, user)
})

Then('the first consultant status has changed', async ({ page }) => {
  expectDifferent(await consultantStatus(page, mine(page).consultant.user), mine(page).consultant.status)
})

When('they change both external site messages to unique text', async ({ page, runId, cleanup }) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-full', cleanup)
  const original = await readEditors(page)
  mine(page).editors = { original, value: `<p>E2E ${runId}</p>` }
  cleanup(async () => {
    await page.goto(editForms.externalSite.route)
    for (const [i, html] of original.slice(0, 2).entries()) await writeEditor(page, i, html)
    await saveExternalSite(page)
  })
  await writeEditor(page, 0, mine(page).editors.value)
  await writeEditor(page, 1, mine(page).editors.value)
  await saveExternalSite(page)
})

Then('the external site messages keep the new text after reloading', async ({ page }) => {
  await page.goto(editForms.externalSite.route)
  const now = await readEditors(page)
  await expectFieldEquals(now[0], mine(page).editors.value)
  await expectFieldEquals(now[1], mine(page).editors.value)
})



