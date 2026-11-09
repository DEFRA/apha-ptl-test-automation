import { BasePage } from './base.page.js'

/** ProficiencyTestingWeb home menu. */
export class AdminHomePage extends BasePage {
  /** @param {string} name */
  menuLink(name) {
    return this.page.getByRole('link', { name, exact: true }).first() // source: docs/discovery/crawl-admin.json /home.aspx
  }
}
