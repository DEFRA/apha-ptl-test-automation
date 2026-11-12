/* eslint-disable playwright/no-standalone-expect -- playwright-bdd step bodies run inside generated tests */
import { Given, When, Then, test, expect } from '../../support/fixtures.js'

// source: live probe of /Contract/Export*, /Contract/ImportPermits, /Distribution/*, pending update pages (docs/internal/discovery)

const button = (page, name) => page.getByRole('button', { name, exact: true }).first()
const banner = (page) => page.locator('.govuk-notification-banner').filter({ hasNotText: 'Extend session' })

// ---- exports and imports ----------------------------------------------------

When('the user exports using the {string} button', async ({ page, state }, name) => {
  const download = page.waitForEvent('download', { timeout: 60000 })
  await button(page, name).click()
  state.download = await download
})

Then('a file is downloaded', async ({ state }) => {
  expect(state.download.suggestedFilename()).not.toBe('')
})

When('the user presses upload without choosing a template', async ({ page }) => {
  await button(page, 'Upload').click()
})

Then('the page reports that the file was not found', async ({ page }) => {
  await expect(page.getByText('File not found').first()).toBeVisible() // observed live: shown as plain text, not in an error summary
})

Then('the export page offers the template table with upload and export', async ({ page }) => {
  await expect(page.getByRole('table').first()).toBeVisible()
  await expect(page.getByLabel('Upload a template')).toBeVisible()
  await expect(button(page, 'Upload')).toBeVisible()
})

Then('the page says there are no import permits or lists them', async ({ page }) => {
  await expect(page.getByText('There are no import permits to display.').or(page.getByRole('table').first())).toBeVisible()
})

// ---- distribution workflow --------------------------------------------------

Then('every initialised month has both a scheduling and a tabulations link', async ({ page }) => {
  const scheduling = await page.getByRole('link', { name: /^View Scheduling for / }).count()
  const tabulations = await page.getByRole('link', { name: /^View Tabulations for / }).count()
  expect(scheduling, 'initialised months').toBeGreaterThan(0)
  expect(scheduling).toBe(tabulations)
  expect(scheduling).toBeLessThanOrEqual(12)
})

When('the user opens the {string} link of the first scheme on the April schedule', async ({ page }, linkStart) => {
  await page.goto('/Distribution/Schedule?year=2026&monthId=4')
  await page.getByRole('link', { name: new RegExp(`^${linkStart}`) }).first().click()
})

Then('a page headed {string} is shown', async ({ page }, heading) => {
  await expect(page.getByRole('heading', { level: 1, name: heading, exact: true }).first()).toBeVisible()
})

Then('the April schedule lists a distribution with its participants, sample numbers and intended results', async ({ page }) => {
  await expect(page.getByRole('link', { name: /^View Participants for / }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /Sample Numbers for / }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /^View Intended Results for / }).first()).toBeVisible()
})

// ---- pending update decisions (consume a pending item, so opt-in) -----------

const pendingPaths = { customer: '/Customer/ReviewPendingCustomerUpdates', participant: '/Participant/ReviewPendingParticipantUpdates' }

Given('pending update decisions are allowed in this environment', async () => {
  test.info().skip(process.env.ALLOW_PENDING_DECISIONS !== 'true', 'set ALLOW_PENDING_DECISIONS=true: approving or declining consumes a real pending update')
})

Given('a pending {word} update exists', async ({ page, state }, kind) => {
  await page.goto(pendingPaths[kind])
  state.pendingRows = await page.locator('main tbody tr').count()
  test.info().skip(state.pendingRows === 0, `no pending ${kind} update; create one from the external site`)
  state.kind = kind
})

When('the user opens the first pending update', async ({ page }) => {
  await page.getByRole('link', { name: /Details/ }).first().click()
})

Then('the pending update compares current and pending values', async ({ page }) => {
  await expect(page.getByRole('columnheader', { name: 'Pending Value' }).first()).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Current Value' }).first()).toBeVisible()
})

When('the user presses {string} on the pending update', async ({ page }, name) => {
  await button(page, name).or(page.getByRole('link', { name, exact: true })).first().click()
})

Then('one fewer pending update is listed', async ({ page, state }) => {
  await page.goto(pendingPaths[state.kind])
  await expect(page.locator('main tbody tr')).toHaveCount(state.pendingRows - 1)
})

Then('the page confirms the decision', async ({ page }) => {
  await expect(banner(page)).toBeVisible()
})

