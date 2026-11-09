import { expect } from '@playwright/test'
import { orderWizard } from '../content/site.js'

const rowsWithSelect = (page) => page.locator('tr:has(input[id$=Select_InnerCheck])') // source: probe 2026-11-03 PendingContractOrder.aspx rows
const innerFor = (page, code) => rowsWithSelect(page).filter({ hasText: code }).last().locator('input[id$=Select_InnerCheck]') // source: probe 2026-11-03 PendingContractOrder.aspx rows

export async function openOrder(page) {
  await page.goto(orderWizard.route) // source: probe 2026-11-03 PendingContractOrder.aspx
}

/** Select the last scheme that has a month available to order, and return its code. */
export async function selectAvailableScheme(page) {
  const indexes = await page.locator('input[id$=Select_InnerCheck]').evaluateAll((boxes) => boxes.map((b, i) => (!b.disabled && !b.checked ? i : -1)).filter((i) => i >= 0)) // source: probe 2026-11-03 PendingContractOrder.aspx
  for (const index of indexes.reverse().slice(0, 20)) {
    const box = page.locator('input[id$=Select_InnerCheck]').nth(index)
    const row = box.locator('xpath=ancestor::tr[1]')
    const code = /PT\d{4}/.exec(await row.innerText())[0] // source: probe 2026-11-03 scheme rows
    await box.evaluate((el) => el.click()) // source: app/ProficiencyTestingExternalWeb/Controls/MaterialCheckbox.ascx (the hidden server checkbox posts back)
    await expect(innerFor(page, code)).toBeChecked() // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:364
    const strip = innerFor(page, code).locator('xpath=ancestor::tr[1]/following::tr[contains(@id, "MonthStrip")][1]')
    const months = strip.locator('input[id$=_InnerCheck]:not([disabled])') // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:192
    await page.waitForLoadState('networkidle') // the month strip is rendered by the partial postback that follows the click
    const hasMonths = await expect.poll(() => months.count(), { timeout: 8000 }).toBeGreaterThan(0).then(() => true, () => false)
    if (hasMonths) {
      const ticked = strip.locator('input[id$=_InnerCheck]:not([disabled]):checked')
      if ((await ticked.count()) === 0) {
        await months.first().evaluate((el) => el.click()) // a scheme selected before keeps its old months, so tick one
        await expect(ticked).not.toHaveCount(0) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:300-360 (Check_Clicked month branch)
      }
      return code
    }
    await innerFor(page, code).evaluate((el) => el.click()) // no month to order: undo and try the next scheme
    await expect(innerFor(page, code)).not.toBeChecked() // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:364
  }
  throw new Error('No scheme with a month available to order was found')
}
export async function deselectScheme(page, code) {
  await openOrder(page)
  const box = innerFor(page, code)
  if (await box.isChecked()) await box.evaluate((el) => el.click()) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:364
}

export const schemeBox = innerFor
export const nextButton = (page) => page.getByRole('button', { name: orderWizard.next, exact: true }) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:566
export const summaryButton = (page, name) => page.getByRole('button', { name, exact: true }) // source: probe 2026-11-03 summary buttons
export const termsBox = (page) => page.locator('input[id$=CheckBoxTermsAndConditions_InnerCheck]') // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:873




/** Tick every data consent declaration the summary shows (none for most schemes). */
export async function acceptConsents(page) {
  const boxes = page.locator('input[id*=CheckBoxDataConsent][id$=_InnerCheck]') // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:899
  for (let i = 0; i < (await boxes.count()); i++) {
    const box = boxes.nth(i)
    if (!(await box.isChecked())) await box.evaluate((el) => el.click())
    await expect(boxes.nth(i)).toBeChecked() // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:1124
  }
}

export async function submitOrder(page) {
  await page.getByRole('button', { name: 'SUBMIT', exact: true }).click() // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:918
  await page.waitForURL(/\/Home\.aspx/) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:1090 (LeavePage)
}

/** Deselect every scheme left selected on the draft order, so a test starts from an empty selection. */
export async function clearSelections(page) {
  const checked = page.locator('input[id$=Select_InnerCheck]:not([disabled]):checked') // source: probe 2026-11-03 PendingContractOrder.aspx
  for (let guard = 0; guard < 60 && (await checked.count()) > 0; guard++) {
    const before = await checked.count()
    await checked.first().evaluate((el) => el.click()) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:364
    await expect(checked).toHaveCount(before - 1) // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:364
  }
}
