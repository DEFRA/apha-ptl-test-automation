import { expect } from '@playwright/test'

export async function expectPageText(page, text) {
  await expect(page.getByRole('heading', { level: 1, name: 'Customer Details' })).toBeVisible() // source: probe 2026-11-03 Customer.aspx h1
  await expect.poll(() => page.locator('input[type=text]').evaluateAll((els) => els.map((e) => e.value))).toContain(text) // source: probe 2026-11-03 Customer.aspx QAL Number field
}
