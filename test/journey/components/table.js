import { byProfile } from '../support/profiles.js'
import { Component } from './component.js'

/**
 * The GOV.UK table — https://design-system.service.gov.uk/components/table/
 * Rows are found by their first cell, never by row index: the legacy UI and the GDS UI
 * order and count columns differently, and an index silently asserts on the wrong row.
 * For a definition list of key/value pairs use `SummaryList` instead, not this component.
 */
export class Table extends Component {
  /** @param {import('@playwright/test').Locator} [root] */
  constructor(page, root) {
    super(page, root)
  }

  get table() {
    return byProfile({
      legacy: this.root.locator('[data-table]'), // legacy-only: replace with the real widget
      gds: this.root.locator('.govuk-table')
    })
  }

  get caption() {
    return this.table.locator('.govuk-table__caption')
  }

  get headers() {
    return this.table.getByRole('columnheader')
  }

  get rows() {
    return this.table.getByRole('row').filter({ has: this.page.getByRole('cell') })
  }

  /**
   * The row whose first cell starts with the given text.
   * @param {string} firstCell
   */
  row(firstCell) {
    return this.rows.filter({ has: this.page.getByRole('cell', { name: firstCell }) })
  }

  /**
   * @param {string} firstCell
   * @param {string} header column header text, for example "Status"
   * @returns {Promise<import('@playwright/test').Locator>}
   */
  async cell(firstCell, header) {
    const index = await this.columnIndex(header)
    return this.row(firstCell).getByRole('cell').nth(index)
  }

  /**
   * @param {string} firstCell
   * @param {string} header
   */
  async cellText(firstCell, header) {
    const cell = await this.cell(firstCell, header)
    return ((await cell.textContent()) ?? '').trim()
  }

  /**
   * @param {string} firstCell
   * @param {string} header
   * @returns {Promise<import('@playwright/test').Locator>}
   */
  async link(firstCell, header) {
    return (await this.cell(firstCell, header)).getByRole('link')
  }

  /** Number of data rows, excluding any header row. */
  async rowCount() {
    return this.rows.count()
  }

  /**
   * Column position of a header, by its text. Throws rather than returning -1, so a renamed
   * column fails with the header text instead of silently asserting on cell 0.
   * @param {string} header
   * @returns {Promise<number>}
   */
  async columnIndex(header) {
    const all = await this.headers.allTextContents()
    const index = all.findIndex((name) => name.trim() === header)
    if (index === -1) {
      throw new Error(`No column "${header}" in table. Headers: ${all.map((h) => h.trim()).join(', ')}`)
    }
    return index
  }
}
