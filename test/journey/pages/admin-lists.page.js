import { BasePage } from './base.page.js'
import { adminLists, adminSearch } from '../content/site.js'

/** ProficiencyTestingWeb search forms. */
export class AdminSearchPage extends BasePage {
  /** @param {'schemes'|'distributions'|'contracts'|'users'} target */
  box(target) {
    return this.page.locator(`[id$="${adminSearch[target].box}"]`) // source: probe 2026-11-02 admin search pages
  }

  /** @param {'schemes'|'distributions'|'contracts'|'users'} target */
  button(target) {
    return this.page.locator(`[id$="${adminSearch[target].button}"]`) // source: probe 2026-11-02 admin search pages
  }

  /** @param {string} text */
  text(text) {
    return this.page.getByText(text) // source: probe 2026-11-02 admin search pages
  }
}

/** ProficiencyTestingWeb Customers and Schemes lists. */
export class AdminListPage extends BasePage {
  /** @param {string} name */
  columnHeader(name) {
    return this.page.locator('th').filter({ hasText: name }).first() // source: probe 2026-11-02 list headers
  }

  /** @param {string} name */
  link(name) {
    return this.page.getByRole('link', { name, exact: true }).first() // source: probe 2026-11-02 list links
  }

  get statusSelect() { // source: probe 2026-11-02 /Contracts Admin/CustomerList.aspx
    return this.page.locator(`[id$="${adminLists.statusSelect}"]`) // source: probe 2026-11-02 /Contracts Admin/CustomerList.aspx
  }

  get filterButton() { // source: probe 2026-11-02 /Contracts Admin/CustomerList.aspx
    return this.page.getByRole('button', { name: adminLists.filterButton, exact: true }) // source: probe 2026-11-02 /Contracts Admin/CustomerList.aspx
  }

  get dataRows() { // source: probe 2026-11-02 list rows
    return this.page.locator('tr:has(> td > a)') // source: probe 2026-11-02 list rows
  }
}
