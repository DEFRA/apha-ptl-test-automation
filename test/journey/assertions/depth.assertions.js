import { expect } from '@playwright/test'

export async function expectVisible(locator) {
  await expect(locator).toBeVisible()
}

export async function expectRowChanged(row, before) {
  await expect(row).not.toHaveText(before)
}

export function expectSoapResult(result, operation) {
  expect(result.status).toBe(200)
  expect(result.body).toContain(`${operation}Response`)
  expect(result.body).not.toContain('soap:Fault')
}
