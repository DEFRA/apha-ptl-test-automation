import { expect } from '@playwright/test'
import { orderWizard } from '../content/site.js'

export async function expectSchemeSelected(box) {
  await expect(box).toBeChecked() // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:364
}

export async function expectNextEnabled(next) {
  await expect(next).toBeEnabled() // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:1396
}

export async function expectSummaryShown(page) {
  await expect(page.locator('[id$=TitleHeading]')).toHaveText(orderWizard.summaryTitle) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:1032
  await expect(page.locator('body')).toContainText('Schemes you have selected') // source: probe 2026-11-03 summary heading
  for (const name of orderWizard.summaryButtons) await expect(page.getByRole('button', { name, exact: true })).toBeVisible() // source: probe 2026-11-03 summary buttons
}

export async function expectSubmitState(page, enabled) {
  const submit = page.getByRole('button', { name: 'SUBMIT', exact: true })
  if (enabled) await expect(submit).toBeEnabled() // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:1159
  else await expect(submit).toBeDisabled() // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:918
}

export async function expectOrderPage(page) {
  await expect(page.getByRole('heading', { level: 1, name: orderWizard.title })).toBeVisible() // source: probe 2026-11-03 h1
  await expect(page.locator('[id$=TitleHeading]')).not.toHaveText(orderWizard.summaryTitle) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:1043
}

export async function expectOrderSaved(page) {
  await expect(page.locator('body')).toContainText('Pending contract order saved successfully') // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:1104
}

export async function expectOrderAwaiting(check, expected) {
  await expect.poll(check, { timeout: 30000 }).toBe(expected) // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingOrders.aspx
}

export async function expectHome(page) {
  await expect(page).toHaveURL(/\/Home\.aspx/) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb (LeavePage)
}

export async function expectNextDisabled(next) {
  await expect(next).toBeDisabled() // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:566
}

export async function expectSchemeCleared(box) {
  await expect(box).not.toBeChecked() // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:364
}
