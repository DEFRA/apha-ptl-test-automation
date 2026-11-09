import { withBasePath } from '../support/base-path.js'
import { chromium } from '@playwright/test'
import { webUrl } from '../support/env.js'
import { adminPages, participantUpdate } from '../content/site.js'

const contactName = (page) => page.getByRole('textbox', { name: participantUpdate.contactLabel, exact: true }) // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
const updateButton = (page) => page.getByRole('button', { name: participantUpdate.updateButton }) // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx:109

export async function openParticipantDetails(page) {
  await page.goto('/EditParticipantDetails.aspx') // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
}

export const readParticipantContactName = (page) => contactName(page).inputValue()

export async function submitParticipantContactName(page, value) {
  const box = contactName(page)
  await box.fill(value)
  await box.press('Tab') // source: app/ProficiencyTestingExternalWeb/scripts/disable-button.js (focusout enables the button)
  await updateButton(page).click()
  await page.waitForLoadState('load')
}

export const participantFormLocator = (page) => ({ contactName: contactName(page), updateButton: updateButton(page) })

/** Open the admin review of the seeded participant's pending update and press Approve or Decline, in a fresh Windows-auth browser. */
export async function reviewPendingParticipantUpdate(action, { onlyIfPending = false } = {}) {
  const browser = await chromium.launch({ args: ['--auth-server-allowlist=localhost'] }) // source: playwright.config.js admin project
  try {
    const context = await browser.newContext({ baseURL: webUrl() })
    const page = withBasePath(await context.newPage(), webUrl())
    page.on('dialog', (dialog) => dialog.accept()) // source: app/ProficiencyTestingWeb/Contracts Admin/PendingParticipantUpdateDetails.aspx.vb:299 (MessageBox)
    await page.goto(adminPages.pendingParticipantUpdates.route) // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingParticipantUpdates.aspx
    const row = page.getByRole('row').filter({ hasText: participantUpdate.labCode })
    if (onlyIfPending && (await row.count()) === 0) return false
    await row.getByRole('link', { name: 'Details', exact: true }).first().click() // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingParticipantUpdates.aspx
    await page.getByRole('button', { name: action, exact: true }).click() // source: app/ProficiencyTestingWeb/Contracts Admin/PendingParticipantUpdateDetails.aspx.vb:42-66
    await page.waitForURL(/ReviewPendingParticipantUpdates\.aspx/)
    return true
  } finally {
    await browser.close()
  }
}


