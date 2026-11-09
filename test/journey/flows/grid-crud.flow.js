import { crudPages } from '../content/site.js'

const gridRows = (page) => page.locator('table.paleblueborder tr') // source: probe 2026-11-03 editable list pages

export async function openCrudPage(page, key) {
  page.on('dialog', (dialog) => dialog.accept()) // source: app/ProficiencyTestingWeb/Admin/ManageCountries.aspx.vb:148 (MessageBox alerts)
  await page.waitForLoadState('networkidle').catch(() => {}) // a save can still be redirecting
  for (let attempt = 0; attempt < 3; attempt++) {
    const failed = await page.goto(crudPages[key].route).then(() => false, () => true) // source: crudPages in content/site.js
    if (!failed) return
    await page.waitForLoadState('load').catch(() => {})
  }
}

/** Click and wait for the ASP.NET postback to be answered; a following goto would otherwise abort it. */
async function clickAndWaitForPostback(page, locator) {
  const posted = page.waitForResponse((r) => r.request().method() === 'POST', { timeout: 15000 }).catch(() => null)
  await locator.click()
  await posted
  await page.waitForLoadState('networkidle') // a redirect after the postback must finish before the next goto
}

/** Add, rename and remove are staged in the session until the page-level Save is pressed. */
export async function savePage(page) {
  const save = page.locator('input[id$=ButtonSave]') // source: app/ProficiencyTestingWeb/Admin/ManageCountries.aspx.vb:131 (ButtonSave_Click calls mCountries.Save)
  if ((await save.count()) > 0) await clickAndWaitForPostback(page, save.first())
}

/** Fill the add form of the page and press Add. */
export async function addRecord(page, key, name, { submit = true } = {}) {
  const config = crudPages[key]
  await page.locator(`input[id$=${config.addName}]`).fill(name) // source: crudPages in content/site.js
  for (const [id, value] of Object.entries(config.extra ?? {})) await page.locator(`input[id$=${id}]`).fill(value) // source: app/ProficiencyTestingWeb/Admin/ManageExternalTCs.aspx
  if (!submit) return
  const button = page.locator(`input[id$=${config.addButton}]`) // source: crudPages in content/site.js
  if (name === '') await button.click() // client validation blocks it, so no postback follows
  else {
    await clickAndWaitForPostback(page, button)
    await savePage(page)
  }
}

/** Show the page of the list that holds the record by walking the numbered pager (and its "..." block links); returns whether it was found. */
export async function findRecord(page, key, name) {
  await openCrudPage(page, key)
  if (crudPages[key].search) { // a list with a search box finds the record without walking every page
    await searchRecords(page, key, name)
    return (await recordRow(page, name).count()) > 0
  }
  const pager = page.locator('table.paleblueborder tr:last-child a') // source: probe 2026-11-03 pager links
  // The server keeps the last page shown, so go back to page 1 before walking forward.
  for (let back = 0; back < 20; back++) {
    if ((await recordRow(page, name).count()) > 0) return true
    const first = pager.first()
    if ((await first.count()) === 0) break
    const text = (await first.innerText()).trim()
    if (text === '...' || text === '1') await clickAndWaitForPostback(page, first)
    else break
    if (text === '1') break
  }
  let current = 1
  for (let guard = 0; guard < 60; guard++) {
    if ((await recordRow(page, name).count()) > 0) return true
    const next = pager.filter({ hasText: new RegExp(`^\\s*${current + 1}\\s*$`) }).first()
    if ((await next.count()) > 0) {
      await clickAndWaitForPostback(page, next)
      current += 1
    } else {
      const more = pager.filter({ hasText: '...' }).last()
      if ((await more.count()) === 0) return false
      await clickAndWaitForPostback(page, more)
      current += 1
    }
  }
  return false
}
export const recordRow = (page, name) => gridRows(page).filter({ hasText: name }).last() // source: probe 2026-11-03 editable list rows

async function confirmIfAsked(page) {
  const yes = page.getByRole('button', { name: 'Yes', exact: true })
  await yes.waitFor({ state: 'visible', timeout: 3000 }).then(() => yes.click(), () => {}) // a confirmation dialog may follow Remove
  await page.waitForLoadState('load')
}

export async function renameRecord(page, key, name, newName) {
  if (!(await findRecord(page, key, name))) throw new Error(`Record ${name} was not found on ${key}`)
  await clickAndWaitForPostback(page, recordRow(page, name).getByRole('link', { name: 'Edit', exact: true })) // source: probe 2026-11-03 Edit link
  const box = gridRows(page).locator('input[id$=TextboxName], input[id$=TxtName]').first() // source: app/ProficiencyTestingWeb/Scheme Admin/TestTypeList.aspx (row edit box)
  await box.fill(newName)
  await clickAndWaitForPostback(page, gridRows(page).getByRole('link', { name: 'Save', exact: true }).first()) // source: app/ProficiencyTestingWeb/Scheme Admin/TestTypeList.aspx (LinkButtonUpdate)
  await savePage(page)
}

export async function removeRecord(page, key, name) {
  if (!(await findRecord(page, key, name))) return false
  await clickAndWaitForPostback(page, recordRow(page, name).getByRole('link', { name: 'Remove', exact: true })) // source: probe 2026-11-03 Remove link
  await confirmIfAsked(page)
  await savePage(page)
  return true
}

export async function searchRecords(page, key, text) {
  const search = crudPages[key].search
  await page.locator(`input[id$=${search.box}]`).fill(text) // source: crudPages in content/site.js
  await clickAndWaitForPostback(page, page.locator(`input[id$=${search.button}]`)) // source: crudPages in content/site.js
}

export const gridRowCount = async (page) => gridRows(page).count()
export const clientValidationFailed = (page) => page.evaluate(() => window.Page_IsValid === false) // source: ASP.NET client validation (RequiredFieldValidator)


