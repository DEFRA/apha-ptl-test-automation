import { routes } from '../content/routes.js'

/**
 * Locators and navigation only. No assertions: those live in steps or `*.assertions.js`.
 * Every page object extends this and never touches `page.locator('div:nth-child(3)')`.
 */
export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} route route from `content/routes.js`
   */
  constructor(page, route) {
    this.page = page
    this.route = route
    this.root = page.locator('main')
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1 })
  }

  get banner() {
    return this.page.getByRole('banner')
  }

  get footer() {
    return this.page.getByRole('contentinfo')
  }

  /** Navigate to this page's route. */
  async open() {
    await this.page.goto(this.route)
  }

  /** The main form on the page, when there is exactly one. */
  get form() {
    return this.root.getByRole('form')
  }

  /**
   * Every page object must be able to say which route it represents, so navigation tests and
   * the a11y inventory stay in sync.
   * @param {keyof typeof routes} key
   */
  static routeFor(key) {
    return routes[key]
  }

  /** Guard used by assertions, not a test assertion itself. */
  async title() {
    return this.page.title()
  }

  /** @param {string} label */
  async clickButton(label) {
    await this.root.getByRole('button', { name: label, exact: true }).click()
  }

}
