import { confirmAuditIfShown } from '../support/audit.js'
import { schemeTabs, testItems } from '../content/scheme-tabs.js'

const byId = (page, id) => page.locator(`[id$=${id}]`)
const postback = async (page, action) => {
  const answered = page.waitForResponse((response) => response.request().method() === 'POST', { timeout: 30000 }).catch(() => null) // the tabs post back through UpdatePanels, so load state alone returns too early
  await action()
  await answered
  await page.waitForLoadState('load')
}

export async function openFirstScheme(page) {
  await page.goto('/Scheme Admin/SchemeList.aspx') // source: probe 2026-11-03
  await page.getByRole('link', { name: 'Details', exact: true }).first().click()
  await page.waitForLoadState('load')
}

export const selectTab = (page, tab) => page.getByText(tab, { exact: true }).first().click() // source: probe 2026-11-03 Scheme.aspx tabs (a client-side tab switch, no postback)

export const saveTab = async (page, tab) => {
  await postback(page, () => byId(page, schemeTabs.save[tab]).first().click())
  await confirmAuditIfShown(page)
}
export const applyTab = (page, tab) => postback(page, () => byId(page, schemeTabs.apply[tab]).first().click())
export const cancelTab = (page, tab) => postback(page, () => byId(page, schemeTabs.cancel[tab]).first().click())

export async function addTabulation(page, name) {
  const t = schemeTabs.tabulation
  await byId(page, t.addNew).first().click()
  await byId(page, t.name).first().fill(name)
  await postback(page, () => byId(page, t.add).first().click())
  await saveTab(page, 'Results Tabulations')
}

const row = (page, name) => page.locator('tr').filter({ hasText: name }).last() // source: probe 2026-11-03 tabulation rows

export async function renameTabulation(page, name, newName) {
  const t = schemeTabs.tabulation
  await row(page, name).getByRole('link', { name: 'Rename', exact: true }).click() // source: probe 2026-11-03 Rename links
  await byId(page, t.renameBox).first().fill(newName)
  await postback(page, () => byId(page, t.rename).first().click())
  await saveTab(page, 'Results Tabulations')
}

export async function removeTabulation(page, name) {
  if ((await row(page, name).count()) === 0) return
  page.once('dialog', (dialog) => dialog.accept())
  await postback(page, () => row(page, name).getByRole('link', { name: 'Remove', exact: true }).click()) // source: probe 2026-11-03 Remove links
  await saveTab(page, 'Results Tabulations')
}

export const tabulationCount = (page, name) => page.getByText(name, { exact: false }).count()

export async function chooseOtherConsultant(page, index) {
  const box = byId(page, schemeTabs.consultants[index]).first()
  const original = await box.inputValue()
  const options = await box.locator('option').evaluateAll((o) => o.map((x) => x.value))
  const blank = '00000000-0000-0000-0000-000000000000' // the empty choice is not kept when saved
  const used = await Promise.all(schemeTabs.consultants.map((id) => byId(page, id).first().inputValue())) // a consultant already in another slot is not accepted
  const other = options.find((v) => !used.includes(v) && v !== '' && v !== blank)
  await box.selectOption(other)
  return { original, other }
}

export const consultantValue = (page, index) => byId(page, schemeTabs.consultants[index]).first().inputValue()

export async function setConsultant(page, index, value) {
  await byId(page, schemeTabs.consultants[index]).first().selectOption(value)
}

export async function moveFirstMethodItemDownAndBack(page) {
  const m = schemeTabs.moveMethod
  await postback(page, () => byId(page, m.down).first().click())
  await postback(page, () => byId(page, m.up).nth(1).click())
}

const firstTest = (page, kind) => (kind ? page.locator('table.tests').filter({ has: page.locator(testItems[kind].link + ':visible') }) : page.locator('table.tests')).first() // source: Scheme.aspx:548; only some test types have a categories panel, so pick the first test that shows the link of the kind
const removeTestLinks = (page) => page.getByRole('link', { name: testItems.addTest.remove, exact: true })

export const testCount = (page) => removeTestLinks(page).count()

export async function addTestOfLastType(page) {
  const t = testItems.addTest
  await page.getByRole('link', { name: t.link, exact: true }).click()
  const box = page.locator(t.select)
  const last = await box.locator('option').last().getAttribute('value')
  await box.selectOption(last)
  await postback(page, () => page.locator(t.button).click())
}

export async function removeLastTest(page) {
  page.once('dialog', (dialog) => dialog.accept())
  await postback(page, () => removeTestLinks(page).last().click())
}

export const itemCount = (page, kind) => firstTest(page, kind).locator(testItems[kind].rows).count()

export async function addItemToFirstTest(page, kind) {
  const k = testItems[kind]
  await firstTest(page, kind).locator(k.link).last().click()
  await postback(page, () => page.locator(k.button).click())
}

export async function removeLastItemOfFirstTest(page, kind) {
  page.once('dialog', (dialog) => dialog.accept())
  await postback(page, () => firstTest(page, kind).locator(testItems[kind].rows).last().click())
}








