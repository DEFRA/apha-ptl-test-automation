import { Given, When, Then, test } from '../../support/fixtures.js'
import { holdLock } from '../../support/lock.js'
import { openOrder, selectAvailableScheme, deselectScheme, schemeBox, nextButton, summaryButton, termsBox, acceptConsents, submitOrder, clearSelections } from '../../flows/order.flow.js'
import { orderAwaitingReview, reviewPendingOrder } from '../../flows/order-review.flow.js'
import { expectSchemeSelected, expectNextEnabled, expectSummaryShown, expectSubmitState, expectOrderPage, expectOrderSaved, expectOrderAwaiting, expectHome, expectNextDisabled, expectSchemeCleared } from '../../assertions/order.assertions.js'

export { test }

const chosen = new WeakMap()

Given('the customer has the order page open', async ({ page, cleanup }) => {
  test.setTimeout(1200000)
  await holdLock(page, 'order', cleanup)
  await openOrder(page)
  await clearSelections(page)
  cleanup(async () => {
    const code = chosen.get(page)
    if (code) await deselectScheme(page, code)
  })
})

When('they select an available scheme', async ({ page }) => {
  chosen.set(page, await selectAvailableScheme(page))
  await expectSchemeSelected(schemeBox(page, chosen.get(page)))
})

When('they continue to the pending order', async ({ page }) => {
  await expectNextEnabled(nextButton(page))
  await nextButton(page).click()
})

When('they go back to the order page', async ({ page }) => {
  await summaryButton(page, 'PREVIOUS').click()
})

When('they accept the terms and conditions', async ({ page }) => {
  await termsBox(page).evaluate((el) => el.click()) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:873 (hidden server checkbox)
})

When('they save the pending order', async ({ page }) => {
  await summaryButton(page, 'SAVE').click()
  await page.waitForLoadState('load')
})

Then('the selected scheme is ticked', async ({ page }) => {
  await expectSchemeSelected(schemeBox(page, chosen.get(page)))
})

Then('the next button is enabled', async ({ page }) => {
  await expectNextEnabled(nextButton(page))
})

Then('the pending order summary lists the scheme and its buttons', async ({ page }) => {
  await expectSummaryShown(page)
})

Then('the order submit button is disabled', async ({ page }) => {
  await expectSubmitState(page, false)
})

Then('the order submit button is enabled', async ({ page }) => {
  await expectSubmitState(page, true)
})

Then('the first step of the order is shown again', async ({ page }) => {
  await expectOrderPage(page)
})

Then('the pending order summary is still shown', async ({ page }) => {
  await expectSummaryShown(page)
})

Then('the pending order is reported as saved', async ({ page }) => {
  await expectOrderSaved(page)
})


Given('the seeded customer has no order awaiting review', async ({ page, cleanup }) => {
  test.setTimeout(1200000)
  await holdLock(page, 'order', cleanup)
  await reviewPendingOrder('Decline', { onlyIfPending: true }) // clears a submitted order left by an earlier run
  cleanup(() => reviewPendingOrder('Decline', { onlyIfPending: true }))
  cleanup(async () => {
    const code = chosen.get(page)
    if (code) await deselectScheme(page, code)
  })
  await openOrder(page)
})

When('they tick any consent declarations shown', async ({ page }) => {
  await acceptConsents(page)
})

When('they submit the order', async ({ page }) => {
  await submitOrder(page)
})

When('an admin declines the pending order', async () => {
  await reviewPendingOrder('Decline')
})

Then('the customer is returned to Home', async ({ page }) => {
  await expectHome(page)
})

Then('the order is waiting for admin review', async () => {
  await expectOrderAwaiting(orderAwaitingReview, true)
})

Then('the order is no longer waiting for admin review', async () => {
  await expectOrderAwaiting(orderAwaitingReview, false)
})

Then('a new order starts without a selection', async ({ page }) => {
  await openOrder(page)
  await expectNextDisabled(nextButton(page))
})


When('they deselect that scheme', async ({ page }) => {
  await schemeBox(page, chosen.get(page)).evaluate((el) => el.click()) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:364
  await expectSchemeCleared(schemeBox(page, chosen.get(page)))
})

Then('the next button is disabled', async ({ page }) => {
  await expectNextDisabled(nextButton(page))
})

