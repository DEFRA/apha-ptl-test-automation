import { expect } from '@playwright/test'

export async function expectCustomerDetailsPageLoaded(page) {
  await expect(page.getByRole('heading', { level: 1, name: 'Edit Customer/Invoice details' })).toBeVisible()
}

export async function expectOrderPageLoaded(page) {
  await expect(page.getByRole('heading', { level: 1, name: 'Create New Order' })).toBeVisible() // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx
}

export async function expectCustomerDetailsSaved(page) {
  await expect(page.locator('body')).toContainText('saved')
}

export async function expectCustomerDetailsValidation(page) {
  await expect(page.locator('body')).toContainText('must be specified')
}

export async function expectTermsConsentErrors(page) {
  await expect(page.locator('body')).toContainText('Please accept the terms and conditions')
  await expect(page.locator('body')).toContainText('Please accept all data consent declarations')
}

export async function expectCustomerDetailsEditable(page) {
  await expect(page.locator('[id$=ButtonUpdateDetails]')).toBeEnabled() // source: app/ProficiencyTestingExternalWeb/scripts/disable-button.js
}

export async function expectOrderCannotProgress(page) {
  await expect(page.locator('[id$=BtnNext]')).toBeDisabled() // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:566
}

