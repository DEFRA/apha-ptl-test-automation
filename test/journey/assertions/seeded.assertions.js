import { expect } from '@playwright/test'

export async function expectSeededText(page, text) {
  await expect(page.locator('body')).toContainText(text) // source: data/seed/apply.sql
}
