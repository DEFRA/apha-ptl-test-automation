import { confirmAuditIfShown } from '../support/audit.js'
import { editForms } from '../content/edit-forms.js'

const byId = (page, id) => page.locator(`[id$=${id}]`).first() // source: ASP.NET control ids on the edit forms

/** Open the first record of a kind from its list, so its edit form is shown. */
export async function openFirstRecord(page, kind) {
  const start = { customer: '/Contracts Admin/CustomerList.aspx', participant: '/Contracts Admin/CustomerList.aspx', contract: '/Contracts Admin/CustomerList.aspx', scheme: '/Scheme Admin/SchemeList.aspx' }[kind] // source: probe 2026-11-03 list pages
  const via = { participant: 'Participants', contract: 'Contracts' }[kind]
  const details = page.locator('table a').filter({ hasText: /^Details$/ }) // source: probe 2026-11-03 Details links in the grids
  if (!via) {
    await page.goto(start)
    await details.first().click()
    await page.waitForLoadState('load')
    return
  }
  // The first customers may have no participants or contracts, so try each one until a list has a record.
  for (let index = 0; index < 20; index++) {
    await page.goto(start)
    const links = page.getByRole('link', { name: via, exact: true })
    if (index >= (await links.count())) break
    await links.nth(index).click()
    await page.waitForLoadState('load')
    if ((await details.count()) > 0) {
      await details.first().click()
      await page.waitForLoadState('load')
      return
    }
  }
  throw new Error(`No customer in the first 20 has a ${kind} to open`)
}

export async function setField(page, id, value) {
  await byId(page, id).fill(value)
}

export const readField = (page, id) => byId(page, id).inputValue()

const saveButton = (page) => page.locator('[id$=ButtonSave], [id$=ButtonSave1]').first() // source: ButtonSave on customer, participant and contract; ButtonSave1 on the Scheme.aspx details tab

export async function saveRecord(page) {
  await saveButton(page).click()
  await page.waitForLoadState('load')
  await confirmAuditIfShown(page)
}

export async function attemptSave(page) {
  await saveButton(page).click()
}

export async function copyContactToInvoice(page) {
  await byId(page, editForms.customer.copy).click()
  await page.waitForLoadState('load')
}

export async function addFirstViewer(page) {
  const v = editForms.viewers
  const before = await byId(page, v.selected).locator('option').count()
  await byId(page, v.possible).selectOption({ index: 0 })
  await byId(page, v.add).click()
  await page.waitForLoadState('load')
  return before
}

export async function removeAllAddedViewers(page, before) {
  const v = editForms.viewers
  const selected = byId(page, v.selected).locator('option')
  const now = await selected.count()
  if (now <= before) return
  await byId(page, v.selected).selectOption({ index: now - 1 })
  await byId(page, v.remove).click()
  await page.waitForLoadState('load')
  await byId(page, v.save).click()
  await page.waitForLoadState('load')
}

export async function saveViewers(page) {
  await byId(page, editForms.viewers.save).click()
  await page.waitForLoadState('load')
}

export const selectedViewerCount = (page) => byId(page, editForms.viewers.selected).locator('option').count()

const toggleLink = (page) => page.locator('[id$=LinkButtonToggleInactive]') // source: app/ProficiencyTestingWeb/Admin/TCDepartment.aspx LinkButtonToggleInactive

// Exact username, since Username 1 is a prefix of Username 12.
const consultantRow = (page, user) => page.locator('tr').filter({ has: page.locator('td:first-child').filter({ hasText: new RegExp('^\\s*' + user + '\\s*$') }) })

/** The first consultant row: its username (first cell) and its current status link text. */
export async function firstConsultant(page) {
  const row = page.locator('tr').filter({ has: toggleLink(page) }).first()
  return { user: (await row.locator('td').first().innerText()).trim(), status: (await toggleLink(page).first().innerText()).trim() }
}

export async function toggleConsultant(page, user) {
  await consultantRow(page, user).locator('[id$=LinkButtonToggleInactive]').first().click()
  await page.waitForLoadState('load')
}

export const consultantStatus = async (page, user) => (await consultantRow(page, user).locator('[id$=LinkButtonToggleInactive]').first().innerText()).trim()

// tinymce.get() lists the editors; tinymce.editors is not defined in this TinyMCE version (probe 2026-11-04).
export async function readEditors(page) {
  await page.waitForFunction(() => (window.tinymce ? window.tinymce.get().length : 0) >= 2) // source: EditMessageOnWebsite.aspx has two tinyMCE editors
  return page.evaluate(() => window.tinymce.get().map((e) => e.getContent()))
}

export const writeEditor = (page, index, html) => page.evaluate(([i, h]) => { window.tinymce.get()[i].setContent(h) }, [index, html]) // source: EditMessageOnWebsite.aspx tinyMCE editors

export async function saveExternalSite(page) {
  await byId(page, editForms.externalSite.save).click()
  await page.waitForLoadState('load')
}

