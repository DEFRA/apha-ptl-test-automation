import { byProfile } from '../support/profiles.js'
import { Component } from './component.js'

/**
 * The GOV.UK task list. GDS-only in practice; a legacy "application progress" page needs
 * its own component rather than a fallback inside this one.
 */
export class TaskList extends Component {
  /** @param {import('@playwright/test').Locator} [root] */
  constructor(page, root) {
    super(page, root)
  }

  get list() {
    return byProfile({
      legacy: this.root.locator('[data-task-list]'), // legacy-only: replace with the real widget
      gds: this.root.locator('.govuk-task-list')
    })
  }

  /** @param {string} task */
  row(task) {
    return this.list.locator('.govuk-task-list__item').filter({ hasText: task })
  }

  /** @param {string} task */
  link(task) {
    return this.row(task).getByRole('link')
  }

  /** @param {string} task */
  async open(task) {
    await this.link(task).click()
  }

  /** The status text for a task, for example "Completed" or "Cannot start yet". */
  async status(task) {
    return ((await this.row(task).locator('.govuk-task-list__status').textContent()) ?? '').trim()
  }
}
