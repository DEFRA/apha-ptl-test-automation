import { expect } from '@playwright/test'

export async function expectFieldEquals(actual, expected) {
  expect(actual).toBe(expected) // source: edit form field after a reload
}

export async function expectValidationBlocked(page) {
  await expect.poll(() => page.evaluate(() => window.Page_IsValid === false)).toBe(true) // source: ASP.NET client validators on the edit forms
}

export function expectNotEmpty(value) {
  expect(value.length).toBeGreaterThan(0) // source: Customer.aspx.vb LoadFormFromObject sets the inactive date
}

export function expectDifferent(a, b) {
  expect(a).not.toBe(b) // source: TCDepartment.aspx status toggle flips Active and Inactive
}

export function expectMore(now, before) {
  expect(now).toBeGreaterThan(before) // source: ParticipantViewers.aspx BtnAdd moves a viewer to the selected list
}
