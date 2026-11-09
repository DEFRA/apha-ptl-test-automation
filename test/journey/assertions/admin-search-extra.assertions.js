import { expect } from '@playwright/test'

export async function expectMaxLength(box, max) {
  await expect(box).toHaveAttribute('maxlength', String(max)) // source: probe 2026-11-03 /Distributions/ParticipantAddress.aspx maxLength
}
