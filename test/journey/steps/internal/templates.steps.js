/* eslint-disable playwright/no-standalone-expect -- playwright-bdd step bodies run inside generated tests */
import path from 'node:path'
import { When, Then, test, expect } from '../../support/fixtures.js'

// source: Features/Contract (export template pages), PTL.Core/Contract/Export/Templates/ExportTemplateService.cs (file name pattern ^\w[\w\s]*\.docx$, 4 MB limit, unique name),
// live probe scripts/probe-upload.js. Uploads are removed and the previously selected template is restored in teardown.

const rows = (page) => page.locator('main tbody tr')
const rowFor = (page, name) => rows(page).filter({ hasText: name })
const button = (page, name) => page.getByRole('button', { name, exact: true }).first()
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

async function selectedTemplate(page) {
  const cell = page.locator('main tbody tr.ptl-template-selected td').first()
  return (await cell.count()) ? (await cell.textContent()).trim() : null
}

async function restore(page, pagePath, { original, name }) {
  await page.goto(pagePath)
  const selected = await selectedTemplate(page)
  if (original && selected !== original && (await rowFor(page, original).count())) {
    await rowFor(page, original).getByRole('button', { name: /Select/ }).click()
    await page.goto(pagePath)
  }
  if (await rowFor(page, name).count()) {
    await rowFor(page, name).first().getByRole('button', { name: /Delete/ }).click()
    await button(page, 'Delete').click() // confirmation page: Are you sure that you want to delete this template?
  }
}

async function remember(page, state, cleanup, name) {
  state.template = { path: page.url().replace(/^https?:\/\/[^/]+/, ''), original: await selectedTemplate(page), name }
  await cleanup(() => restore(page, state.template.path, state.template))
}

When('the user uploads the template file {string} from the test data folder', async ({ page, state, cleanup }, name) => {
  await remember(page, state, cleanup, name)
  await page.getByLabel('Upload a template').setInputFiles(path.resolve('data/files', name))
  await button(page, 'Upload').click()
})

When('the user uploads a generated file named {string} of {int} bytes', async ({ page, state, cleanup }, name, size) => {
  await remember(page, state, cleanup, name)
  await page.getByLabel('Upload a template').setInputFiles({ name, mimeType: DOCX, buffer: Buffer.alloc(size, 0x41) })
  await button(page, 'Upload').click()
})

Then('the export page reports {string}', async ({ page }, message) => {
  await expect(page.getByText(message, { exact: false }).first()).toBeVisible()
})

Then('the template {string} is listed', async ({ page }, name) => {
  await expect(rowFor(page, name)).toHaveCount(1)
})

Then('the template {string} is not listed', async ({ page }, name) => {
  await page.goto('/Contract/ExportContracts')
  await expect(rowFor(page, name)).toHaveCount(0)
})

When('the user selects the template {string}', async ({ page }, name) => {
  await rowFor(page, name).getByRole('button', { name: /Select/ }).click()
})

Then('the template {string} is the selected template', async ({ page }, name) => {
  await expect(page.locator('main tbody tr.ptl-template-selected')).toContainText(name)
})

When('the user starts deleting the template {string}', async ({ page }, name) => {
  await rowFor(page, name).first().getByRole('button', { name: /Delete/ }).click()
})

Then('the user is asked to confirm deleting the template', async ({ page }) => {
  await expect(page.getByText('Are you sure that you want to delete this template?')).toBeVisible()
})

When('the user confirms deleting the template', async ({ page }) => {
  await button(page, 'Delete').click()
})

When('the user declines deleting the template', async ({ page }) => {
  await button(page, 'Cancel').or(page.getByRole('link', { name: 'Cancel', exact: true })).first().click()
})

When('the user selects the template that was selected before', async ({ page, state }) => {
  await rowFor(page, state.template.original).getByRole('button', { name: /Select/ }).click()
})

When('the user exports contracts and waits up to {int} seconds for the file', async ({ page, state }, seconds) => {
  test.setTimeout((seconds + 60) * 1000)
  const download = page.waitForEvent('download', { timeout: seconds * 1000 })
  await button(page, 'Export').click({ noWaitAfter: true }) // the merge runs about 30 s, longer than the action timeout
  state.download = await download
})

Then('the downloaded file name matches {string}', async ({ state }, pattern) => {
  expect(state.download.suggestedFilename()).toMatch(new RegExp(pattern))
})



