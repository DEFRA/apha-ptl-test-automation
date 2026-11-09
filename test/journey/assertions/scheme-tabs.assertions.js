import { expect } from '@playwright/test'
import { tabulationCount, consultantValue, testCount, itemCount } from '../flows/scheme-tabs.flow.js'

export async function expectTabulation(page, name, listed) {
  await expect.poll(() => tabulationCount(page, name)).toBe(listed ? 1 : 0) // source: Scheme.aspx Results Tabulations list
}

export async function expectConsultant(page, index, expected) {
  expect(await consultantValue(page, index)).toBe(expected) // source: Scheme.aspx Test consultants tab
}

export async function expectTestCount(page, expected) {
  await expect.poll(() => testCount(page)).toBe(expected) // source: Scheme.aspx Tests tab Remove Test links
}

export async function expectItemCount(page, kind, expected) {
  await expect.poll(() => itemCount(page, kind)).toBe(expected) // source: Scheme.aspx Tests tab item grids
}

