import { expect } from '@playwright/test'
import { adminLists, adminSearch } from '../content/site.js'

export async function expectNoResults(search) {
  await expect(search.text(adminSearch.noResults).first()).toBeVisible()
}

export async function expectSomeResults(search) {
  await expect(search.text(adminSearch.noResults)).toHaveCount(0)
}

export async function expectResultText(search, text) {
  await expect(search.text(text).first()).toBeVisible()
}

export async function expectTabs(search, names) {
  for (const name of names) await expect(search.text(name).first()).toBeVisible()
}

export async function expectBoxAndButton(search, target) {
  await expect(search.box(target)).toBeVisible()
  await expect(search.button(target)).toBeVisible()
}

export async function expectCustomerSearchFields(search) {
  for (const label of adminSearch.customerFields) await expect(search.text(label).first()).toBeVisible()
}

export async function expectColumns(list, names) {
  for (const name of names) await expect(list.columnHeader(name)).toBeVisible()
}

export async function expectLinks(list, names) {
  for (const name of names) await expect(list.link(name)).toBeVisible()
}

export async function expectStatusOptions(list) {
  await expect(list.statusSelect.locator('option')).toHaveText(adminLists.statusOptions)
  await expect(list.filterButton).toBeVisible()
}

export async function expectRows(list) {
  await expect(list.dataRows.first()).toBeVisible()
}

export async function expectSeededScheme(list) {
  const row = list.dataRows.filter({ hasText: adminLists.seededScheme.identifier }).first()
  await expect(row).toBeVisible()
  await expect(row).toContainText(adminLists.seededScheme.name)
}
