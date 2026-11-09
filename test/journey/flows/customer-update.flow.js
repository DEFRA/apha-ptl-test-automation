import { withBasePath } from '../support/base-path.js'
import { chromium } from '@playwright/test'
import { webUrl } from '../support/env.js'
import { adminPages, customerUpdate } from '../content/site.js'

const contactName = (page) => page.getByRole('textbox', { name: customerUpdate.contactLabel, exact: true }) // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:218
const updateButton = (page) => page.getByRole('button', { name: customerUpdate.updateButton }) // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx

export async function openCustomerDetails(page) {
  await page.goto('/EditCustomerDetails.aspx') // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx
}

export async function readContactName(page) {
  return contactName(page).inputValue()
}

/** Type a value (or the same value, which still enables the button on focus out) and press UPDATE DETAILS. */
export async function submitContactName(page, value) {
  const box = contactName(page)
  await box.fill(value)
  await box.press('Tab') // source: app/ProficiencyTestingExternalWeb/scripts/disable-button.js (focusout enables the button)
  await updateButton(page).click()
  await page.waitForLoadState('load')
}

export const customerFormLocator = (page) => ({ contactName: contactName(page), updateButton: updateButton(page) })

/** Open the admin review of the seeded customer's pending update and press Approve or Decline, in a fresh Windows-auth browser. */
export async function reviewPendingCustomerUpdate(action, { onlyIfPending = false } = {}) {
  const browser = await chromium.launch({ args: ['--auth-server-allowlist=localhost'] }) // source: playwright.config.js admin project
  try {
    const context = await browser.newContext({ baseURL: webUrl() })
    const page = withBasePath(await context.newPage(), webUrl())
    page.on('dialog', (dialog) => dialog.accept()) // source: app/ProficiencyTestingWeb/Contracts Admin/PendingCustomerUpdateDetails.aspx.vb:46 (MessageBox)
    await page.goto(adminPages.pendingCustomerUpdates.route) // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingCustomerUpdates.aspx
    const row = page.getByRole('row').filter({ hasText: customerUpdate.qal })
    if (onlyIfPending && (await row.count()) === 0) return false
    await row.getByRole('link', { name: 'Details', exact: true }).first().click() // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingCustomerUpdates.aspx:18
    await page.getByRole('button', { name: action, exact: true }).click() // source: app/ProficiencyTestingWeb/Contracts Admin/PendingCustomerUpdateDetails.aspx:288-290
    await page.waitForURL(/ReviewPendingCustomerUpdates\.aspx/)
    return true
  } finally {
    await browser.close()
  }
}


