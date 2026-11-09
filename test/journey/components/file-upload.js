import { byProfile } from '../support/profiles.js'
import { Component } from './component.js'

/** A file upload field. Use synthetic fixtures only, never real documents. */
export class FileUpload extends Component {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {{ id: string, label: string }} field
   * @param {import('@playwright/test').Locator} [root]
   */
  constructor(page, { id, label }, root) {
    super(page, root)
    this.id = id
    this.label = label
  }

  get input() {
    return byProfile({
      legacy: this.root.locator(`#${this.id}`), // legacy-only: id-based lookup
      gds: this.root.getByLabel(this.label, { exact: true })
    })
  }

  /** @param {string} filePath path to a synthetic fixture */
  async upload(filePath) {
    await this.input.setInputFiles(filePath)
  }

  async selectedFileName() {
    return (await this.input.evaluate((el) => el.files?.[0]?.name ?? '')) || ''
  }

  get error() {
    return this.errorFor(this.id)
  }
}
