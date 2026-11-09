/** Change the contact name on the customer form without saving. */
export async function changeCustomerContactName(page, value) {
  await page.locator('input[id*=ContactNameMaterialTextBox]:not([type=hidden])').fill(value) // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:193
  await page.locator('input[id*=ContactNameMaterialTextBox]:not([type=hidden])').press('Tab') // blur so the client validators run
}



