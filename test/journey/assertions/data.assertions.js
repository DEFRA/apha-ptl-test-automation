import { expect } from '@playwright/test'
import { groupAddressForm, participantForm, pendingUpdates } from '../content/site.js'

export async function expectGroupAddressValue(form, key, value) {
  await expect(form.field(key)).toHaveValue(value)
}

export async function expectGroupAddressListed(list, identifier) {
  await expect(list.rowFor(identifier).first()).toBeVisible()
}

export async function expectRequiredMessages(form) {
  for (const pattern of groupAddressForm.required) await expect(form.validation(pattern).first()).toBeVisible()
}

export async function expectPendingTable(pending) {
  for (const name of pendingUpdates.columns) await expect(pending.columnHeader(name).first()).toBeVisible()
  await expect(pending.detailsLinks.first()).toBeVisible()
}

export async function expectPendingButtons(pending) {
  for (const name of pendingUpdates.buttons) await expect(pending.button(name)).toBeVisible()
}

export async function expectParticipantMessage(page, text) {
  await expect(page.locator('body')).toContainText(text)
}

export async function expectParticipantForm(page) {
  for (const label of participantForm.fields) await expect(page.getByLabel(label, { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: participantForm.update, exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: participantForm.cancel, exact: true })).toBeVisible()
}
