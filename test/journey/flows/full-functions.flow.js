import { confirmAuditIfShown } from '../support/audit.js'
import { userAdmin, schemeCreate, customerNotes, pricingRenew } from '../content/full-functions.js'

const byId = (page, id) => page.locator(`[id$=${id}]`).first() // source: ASP.NET control ids on the admin pages

export async function requestExport(page, name) {
  const answer = Promise.race([
    page.waitForEvent('download', { timeout: 90000 }),
    page.waitForEvent('popup', { timeout: 90000 }),
    page.waitForLoadState('load', { timeout: 90000 })
  ]).catch(() => null) // an export may download a file, open a window or reload the page
  await page.getByRole('link', { name, exact: true }).first().click() // source: app/ProficiencyTestingWeb/Contracts Admin/ContractList.aspx export links
  return answer
}

export async function searchDirectory(page) {
  await byId(page, userAdmin.searchBox).fill(userAdmin.directoryUser) // source: UserCreate.aspx
  await byId(page, userAdmin.searchButton).click()
  await page.waitForLoadState('load')
}

export async function createFoundUser(page) {
  const list = byId(page, userAdmin.userList)
  const label = (await list.locator('option').nth(1).innerText()).trim() // source: first directory match after the "please select" entry
  await list.selectOption({ index: 1 })
  await byId(page, userAdmin.department).fill(userAdmin.department_value)
  await byId(page, userAdmin.create).click()
  await page.waitForLoadState('load')
  return label
}

export async function removeUserByLabel(page, label) {
  await page.goto(userAdmin.deleteRoute) // source: app/ProficiencyTestingWeb/Admin/UserDelete.aspx
  await byId(page, userAdmin.userList).selectOption({ label })
  await byId(page, userAdmin.remove).click()
  await page.waitForLoadState('load')
}

export async function fillNewScheme(page, runId) {
  for (const [id, value] of Object.entries(schemeCreate.fields)) await byId(page, id).fill(value.replace('RUN', `E2E-${runId}`.slice(0, 20)))
  for (const select of await page.locator('select:visible').all()) {
    if ((await select.locator('option').count()) > 1 && !(await select.inputValue())) await select.selectOption({ index: 1 }) // required dropdowns start on "- Please Select -"
  }
}

export async function saveScheme(page) {
  await byId(page, schemeCreate.save).click()
  await page.waitForLoadState('load')
  await confirmAuditIfShown(page)
}

export async function setNotes(page, value) {
  await byId(page, customerNotes.box).fill(value)
  await byId(page, customerNotes.save).click()
  await page.waitForLoadState('load')
}

export const readNotes = (page) => byId(page, customerNotes.box).inputValue()

export async function renewPricingPlan(page, key) {
  const renew = page.locator(pricingRenew[key].renew).first()
  const text = (await renew.innerText().catch(() => '')) || (await renew.getAttribute('value')) || ''
  const year = /\d{4}\/\d{2}/.exec(text)?.[0] // source: probe 2026-11-03 "Renew pricing plan for financial year 2027/28"
  await renew.click()
  await page.waitForLoadState('load')
  return year
}

