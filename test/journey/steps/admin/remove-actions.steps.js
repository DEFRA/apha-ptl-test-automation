import { When, test } from '../../support/fixtures.js'
import { holdLock } from '../../support/lock.js'

When('they confirm the first visible {string} link', async ({ page, cleanup }, name) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-full', cleanup)
  page.on('dialog', (dialog) => dialog.accept()) // source: Scheme.aspx:565 and ContractItems.aspx confirm before removing
  await page.getByRole('link', { name, exact: true }).locator('visible=true').first().click() // source: probe 2026-11-03 Remove and Delete links on ContractItems.aspx, Export*.aspx, Scheme.aspx
  await page.waitForLoadState('load')
})
