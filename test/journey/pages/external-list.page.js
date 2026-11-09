import { BasePage } from './base.page.js'
import { listContent } from '../content/site.js'

/** Home cards, scheme table and the search form shared by the External list pages. */
export class ExternalListPage extends BasePage {
  /** @param {string} name card h3 text */
  card(name) {
    return this.page.getByRole('link').filter({ has: this.page.getByRole('heading', { level: 3, name, exact: true }) }) // source: docs/discovery/crawl.json /Home.aspx headings
  }

  /** @param {string} name */
  columnHeader(name) {
    return this.page.locator('th').filter({ hasText: name }) // source: crawl http://localhost:1688/SchemeList.aspx th
  }

  get dataRows() { // source: crawl http://localhost:1688/SchemeList.aspx rows
    return this.page.locator('tr:has(td)') // source: crawl http://localhost:1688/SchemeList.aspx rows
  }

  /** @param {string} label */
  searchField(label) {
    return this.page.getByLabel(label, { exact: true }) // source: crawl http://localhost:1688/Tabulations.aspx labels
  }

  get searchButton() { // source: crawl http://localhost:1688/Tabulations.aspx buttons
    return this.page.getByRole('button', { name: listContent.searchButton, exact: true }) // source: crawl http://localhost:1688/Tabulations.aspx buttons
  }

  get showAllButton() { // source: crawl http://localhost:1688/Tabulations.aspx buttons
    return this.page.getByRole('button', { name: listContent.showAllButton, exact: true }) // source: crawl http://localhost:1688/Tabulations.aspx buttons
  }

  /** @param {string} text */
  message(text) {
    return this.page.getByText(text, { exact: true }) // source: crawl http://localhost:1688/DistributionsCurrent.aspx
  }
}
