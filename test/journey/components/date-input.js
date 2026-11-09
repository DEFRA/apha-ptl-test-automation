import { byProfile } from '../support/profiles.js'
import { Component } from './component.js'

/**
 * Date entry. This is the clearest shape change in the migration:
 * legacy is one free-text field, GOV.UK Frontend is three fields inside a group.
 * Flows call `fill()` and never know which UI is running.
 */
export class DateInput extends Component {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {{ id: string, legend: string }} field
   * @param {import('@playwright/test').Locator} [root]
   */
  constructor(page, { id, legend }, root) {
    super(page, root)
    this.id = id
    this.legend = legend
  }

  get group() {
    return this.root.getByRole('group', { name: this.legend })
  }

  get parts() {
    return byProfile({
      legacy: { single: this.root.locator(`#${this.id}`) }, // legacy-only: one free-text date field
      gds: {
        day: this.group.getByLabel('Day', { exact: true }),
        month: this.group.getByLabel('Month', { exact: true }),
        year: this.group.getByLabel('Year', { exact: true })
      }
    })
  }

  get error() {
    return this.errorFor(this.id)
  }

  /**
   * Enter a date. Legacy expects whatever format the app accepts; GDS takes parts.
   * @param {{ day: string, month: string, year: string, legacyFormat?: string }} value
   */
  async fill(value) {
    const parts = this.parts
    if (parts.single) {
      await parts.single.fill(value.legacyFormat ?? `${value.day}/${value.month}/${value.year}`)
      return
    }
    await parts.day.fill(value.day)
    await parts.month.fill(value.month)
    await parts.year.fill(value.year)
  }

  /** @param {string} iso `YYYY-MM-DD` */
  static toParts(iso) {
    const [year, month, day] = iso.split('-')
    return { day, month, year }
  }
}
