/**
 * Base for GovUK/legacy widget wrappers. Components own locators and actions only:
 * no assertions, no business rules, no visible text of their own (callers pass labels
 * from `content/`).
 */
export class Component {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').Locator} [root] containing landmark, normally `main`
   */
  constructor(page, root) {
    this.page = page
    this.root = root ?? page.locator('main')
  }

  /**
   * The GOV.UK error message for a field id. The same convention covers GOV.UK Frontend
   * (`#<id>-error`) and the scaffolded legacy markup; override in a subclass when the
   * legacy app uses something else.
   * @param {string} id
   * @returns {import('@playwright/test').Locator}
   */
  errorFor(id) {
    return this.page.locator(`#${id}-error`)
  }
}
