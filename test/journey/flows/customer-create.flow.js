import { customerCreate } from '../content/customer-create.js'

const field = (page, id) => page.locator(`[id$=${id}]`).first() // source: app/ProficiencyTestingWeb/Contracts Admin/Customer.aspx control ids

export async function openCreateCustomer(page) {
  await page.goto(customerCreate.route) // source: app/ProficiencyTestingWeb/Contracts Admin/CustomerList.aspx Create Customer link
}

export async function fillRequiredCustomerFields(page, name) {
  for (const [id, value] of Object.entries(customerCreate.textFields)) await field(page, id).fill(value.replace('NAME', name))
  for (const id of customerCreate.dropdowns) await field(page, id).selectOption({ index: 1 }) // source: probe 2026-11-03 first real option after "- Please Select -"
}

export async function saveCustomer(page) {
  await field(page, customerCreate.save).click() // source: Customer.aspx ButtonSave
  await page.waitForLoadState('load')
}

/** A customer cannot be deleted, so the test leaves it inactive. */
export async function makeCustomerInactive(page) {
  const active = field(page, customerCreate.activeBox)
  if ((await active.count()) === 0 || !(await active.isChecked())) return
  await active.uncheck() // source: Customer.aspx CheckBoxIsActive (AutoPostBack)
  await page.waitForLoadState('load')
  await saveCustomer(page)
}
