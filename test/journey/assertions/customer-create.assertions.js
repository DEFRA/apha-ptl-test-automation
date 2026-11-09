import { expect } from '@playwright/test'
import { customerCreate, labelPrint } from '../content/customer-create.js'

export async function expectCustomerSaved(page, messages) {
  await expect.poll(() => messages.join(' | ')).toContain(customerCreate.savedMessage) // source: Customer.aspx.vb:243
  await expect(page.getByRole('button', { name: 'Go to Participants Page' })).toBeVisible() // source: Customer.aspx.vb ButtonSave_Click makes it visible after a save
  await expect(page.getByRole('button', { name: 'Go to Contracts Page' })).toBeVisible() // source: Customer.aspx.vb ButtonSave_Click makes it visible after a save
}

export async function expectLabelPrintAnswered(page) {
  const pattern = new RegExp(labelPrint.messages.join('|'))
  await expect(page.getByText(pattern).first()).toBeVisible() // source: GroupAddress.aspx.vb:28-30 either message is a valid answer from the printer service
}
