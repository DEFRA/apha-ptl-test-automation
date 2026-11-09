import { expect } from '@playwright/test'
import { crudPages } from '../content/site.js'
import { findRecord, gridRowCount, clientValidationFailed } from '../flows/grid-crud.flow.js'

export async function expectRecordListed(page, key, name) {
  await expect.poll(() => findRecord(page, key, name), { message: `${name} is listed on ${key}`, timeout: 60000, intervals: [3000] }).toBe(true) // lists can lag a save; source: crudPages in content/site.js
}

export async function expectRecordAbsent(page, key, name) {
  await expect.poll(() => findRecord(page, key, name), { message: `${name} is not listed on ${key}`, timeout: 60000, intervals: [3000] }).toBe(false) // source: crudPages in content/site.js
}

export async function expectCrudPage(page, key) {
  await expect(page.getByRole('heading', { level: 1, name: crudPages[key].heading, exact: true }).first()).toBeVisible() // source: probe 2026-11-03 editable list pages
}

export async function expectRequiredBlocked(page, rowsBefore) {
  await expect.poll(() => clientValidationFailed(page)).toBe(true) // source: ASP.NET RequiredFieldValidator on the add form
  expect(await gridRowCount(page)).toBe(rowsBefore) // source: probe 2026-11-03 editable list rows
}

export async function expectNoRecordsShown(page, name) {
  await expect(page.locator('table.paleblueborder tr').filter({ hasText: name })).toHaveCount(0) // source: probe 2026-11-03 editable list rows
}

export async function expectRecordShown(page, name) {
  await expect(page.locator('table.paleblueborder tr').filter({ hasText: name }).last()).toBeVisible() // source: probe 2026-11-03 editable list rows
}

export async function expectDialogMessage(messages, pattern) {
  await expect.poll(() => messages.join(' | ')).toMatch(pattern) // source: app/ProficiencyTestingWeb/Admin/ManageCountries.aspx.vb:121
}

