import { expect } from '@playwright/test'
import { internal } from '../content/internal.js'
import { scanPage } from '../support/a11y.js'
import { textPattern } from '../support/text.js'

const failureHeading = new RegExp(`^(${internal.failureHeadings.join('|')})$`, 'i')

/**
 * Confirms a page answered and rendered its h1; optionally scans it once for accessibility.
 * @param {import('@playwright/test').Page} page
 * @param {{ heading: string, role?: string, scan?: boolean }} options
 */
export async function expectInternalPage(page, { heading, role = 'internal', scan = true }) {
  const h1 = page.getByRole('heading', { level: 1 }).first()
  await expect(h1).toHaveText(textPattern(heading))
  if (scan) await scanPage(page, { variant: 'default', role })
}

/** Visits every link in the side navigation reachable from Home and returns a list of problems. */
export async function crawlSideNavigation(page, { maxPages = 80 } = {}) {
  const problems = []
  const visited = new Set()
  const queue = [`${new URL(page.url()).origin}${internal.routes.home}`]
  const key = (url) => new URL(url).pathname.toLowerCase() + new URL(url).search

  while (queue.length && visited.size < maxPages) {
    const url = queue.shift()
    if (visited.has(key(url))) continue
    visited.add(key(url))

    const response = await page.goto(url)
    const status = response?.status() ?? 0
    const heading = (await page.getByRole('heading', { level: 1 }).first().textContent({ timeout: 15000 }).catch(() => ''))?.trim() ?? ''
    if (status >= 400 || !heading || failureHeading.test(heading)) {
      problems.push(`${new URL(url).pathname}: status ${status}, heading "${heading}"`)
      continue
    }

    const nav = page.getByRole('navigation', { name: 'Primary navigation' })
    const hrefs = await nav.getByRole('link').evaluateAll((links) => links.map((a) => a.href))
    for (const href of hrefs) if (!visited.has(key(href))) queue.push(href)
  }
  return { visited: [...visited], problems }
}
