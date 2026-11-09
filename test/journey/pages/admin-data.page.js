import { BasePage } from './base.page.js'
import { groupAddressForm, pendingUpdates } from '../content/site.js'

/** ProficiencyTestingWeb Group Address list and form. */
export class AdminGroupAddressPage extends BasePage {
  get createLink() { // source: probe 2026-11-02 GroupAddressList.aspx links
    return this.page.getByRole('link', { name: groupAddressForm.createLink, exact: true }) // source: probe 2026-11-02 GroupAddressList.aspx links
  }

  /** @param {string} identifier */
  rowFor(identifier) {
    return this.page.locator('tr:has(> td > a:text-is("Edit"))', { hasText: identifier }) // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddressList.aspx:8-20
  }

  get firstRow() { // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddressList.aspx:8-20
    return this.page.locator('tr:has(> td > a:text-is("Edit"))').first() // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddressList.aspx:8-20
  }

  /** @param {import('@playwright/test').Locator} row */
  editLinkIn(row) {
    return row.getByRole('link', { name: groupAddressForm.editLink, exact: true }) // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddressList.aspx:18
  }

  /** @param {keyof typeof groupAddressForm} key element id suffix key */
  field(key) {
    return this.page.locator(`[id$="${groupAddressForm[key]}"]`) // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:14-46
  }

  get saveButton() { // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:51
    return this.page.getByRole('button', { name: groupAddressForm.save, exact: true }) // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:51
  }

  get cancelButton() { // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:52
    return this.page.getByRole('button', { name: groupAddressForm.cancel, exact: true }) // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:52
  }

  /** @param {RegExp} pattern alt text of a validator image */
  validation(pattern) {
    return this.page.getByRole('img', { name: pattern }) // source: probe 2026-11-02 validator images on GroupAddress.aspx
  }
}

/** ProficiencyTestingWeb pending update review pages. */
export class AdminPendingPage extends BasePage {
  get detailsLinks() { // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingCustomerUpdates.aspx:18
    return this.page.getByRole('link', { name: pendingUpdates.detailsLink, exact: true }) // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingCustomerUpdates.aspx:18
  }

  /** @param {string} name */
  columnHeader(name) {
    return this.page.locator('th').filter({ hasText: name }) // source: probe 2026-11-02 ReviewPendingCustomerUpdates.aspx rows
  }

  /** @param {string} name */
  button(name) {
    return this.page.getByRole('button', { name, exact: true }) // source: app/ProficiencyTestingWeb/Contracts Admin/PendingCustomerUpdateDetails.aspx:288-290
  }
}
