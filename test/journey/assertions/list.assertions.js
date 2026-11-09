import { expect } from '@playwright/test'
import { externalPages, listContent } from '../content/site.js'

export async function expectTitle(page, key) {
  await expect(page).toHaveTitle(externalPages[key].title)
}

export async function expectSchemeTable(list) {
  // Participating is present in the table head but not rendered as visible text, so assert it is attached.
  for (const name of listContent.schemeColumns) await expect(list.columnHeader(name).first()).toBeAttached()
  await expect(list.dataRows.first()).toBeVisible()
}

export async function expectMessage(list, key) {
  await expect(list.message(listContent.messages[key])).toBeVisible()
}

export async function expectSearchForm(list, key) {
  for (const label of externalPages[key].searchLabels) await expect(list.searchField(label)).toBeVisible()
  await expect(list.searchButton).toBeVisible()
  await expect(list.showAllButton).toBeVisible()
}

export async function expectNoSearchForm(list) {
  await expect(list.searchField(listContent.referenceLabel)).toHaveCount(0)
  await expect(list.searchButton).toHaveCount(0)
  await expect(list.showAllButton).toHaveCount(0)
}

export async function expectReferenceEmpty(list) {
  await expect(list.searchField(listContent.referenceLabel)).toHaveValue('')
}

export async function expectNoRows(list) {
  await expect(list.dataRows).toHaveCount(0)
}

/** The list shows rows, or its empty message when there is no data. */
export async function expectListOrMessage(list) {
  await expect(list.dataRows.first().or(list.message(listContent.messages.noDistributions)).first()).toBeVisible()
}
