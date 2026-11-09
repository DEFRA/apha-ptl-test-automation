import { withBasePath } from '../support/base-path.js'
import { AdminGroupAddressPage } from '../pages/admin-data.page.js'
import { adminPages } from '../content/site.js'

/** Open the list, then the edit form of the row whose identifier is given (first row when omitted). */
export async function openGroupAddressForEdit(page, identifier) {
  const list = new AdminGroupAddressPage(page)
  await page.goto(adminPages.groupAddresses.route) // source: docs/discovery/crawl-admin.json /Contracts Admin/GroupAddressList.aspx
  const row = identifier ? list.rowFor(identifier) : list.firstRow
  const found = (await row.locator('> td').first().innerText()).trim()
  await list.editLinkIn(row).click()
  return { list, identifier: found }
}

/** Current values of the fields that the tests change. */
export async function readGroupAddress(page) {
  const form = new AdminGroupAddressPage(page)
  return {
    packing: await form.field('packing').inputValue(),
    telephone: await form.field('telephone').inputValue()
  }
}

/** Put the original values back through the UI, in a fresh context. */
export async function restoreGroupAddress(browser, baseURL, identifier, original) {
  const context = await browser.newContext({ baseURL })
  try {
    const page = withBasePath(await context.newPage(), baseURL)
    const { list } = await openGroupAddressForEdit(page, identifier)
    const form = new AdminGroupAddressPage(page)
    await form.field('packing').fill(original.packing)
    await form.field('telephone').fill(original.telephone)
    await form.saveButton.click()
    await page.waitForURL(`**${adminPages.groupAddresses.route.replace(/ /g, '%20')}`)
    return list
  } finally {
    await context.close()
  }
}


