import { withBasePath } from '../support/base-path.js'
import { chromium } from '@playwright/test'
import { webUrl } from '../support/env.js'
import { startSmtpSink } from '../support/smtp-sink.js'
import { orderReview, customerUpdate } from '../content/site.js'

async function withAdminPage(work) {
  const stopSink = await startSmtpSink() // Decline emails the customer; without a mail server the order would not be deleted
  const browser = await chromium.launch({ args: ['--auth-server-allowlist=localhost'] }) // source: playwright.config.js admin project
  try {
    const page = withBasePath(await (await browser.newContext({ baseURL: webUrl() })).newPage(), webUrl())
    page.on('dialog', (dialog) => dialog.accept()) // source: app/ProficiencyTestingWeb/Contracts Admin/PendingContractOrder.aspx.vb (confirmations)
    await page.goto(orderReview.route) // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingOrders.aspx
    return await work(page)
  } finally {
    await browser.close()
    await stopSink()
  }
}

const orderRow = (page) => page.getByRole('row').filter({ hasText: customerUpdate.qal }) // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingOrders.aspx:10

/** True when the seeded customer has a submitted order waiting in Review Pending Orders. */
export async function orderAwaitingReview() {
  return withAdminPage(async (page) => (await orderRow(page).count()) > 0)
}

/** Open the seeded customer's submitted order and press Decline (removes the order) or Approve. */
export async function reviewPendingOrder(action, { onlyIfPending = false } = {}) {
  return withAdminPage(async (page) => {
    const row = orderRow(page)
    if (onlyIfPending && (await row.count()) === 0) return false
    await row.getByRole('link', { name: orderReview.detailsLink, exact: true }).first().click() // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingOrders.aspx:22
    await page.getByRole('button', { name: action, exact: true }).click() // source: app/ProficiencyTestingWeb/Contracts Admin/PendingContractOrder.aspx:183-184
    await page.waitForURL(/ReviewPendingOrders\.aspx/)
    return true
  })
}



