import { activeCdpPort, cdpBasePort } from './a11y-cdp.js'

/**
 * Lighthouse for every page the tests audit.
 *
 * Lighthouse attaches to the Playwright browser's debugging port (support/a11y-browser.js)
 * instead of launching a second Chrome, which fails on locked-down machines and CI images.
 * Its tab has none of the context's cookies, so the session is passed as a `Cookie` header.
 *
 * Environment:
 *   A11Y_CDP_PORT=9222                  first port of the per-worker range
 *   A11Y_LIGHTHOUSE_FORM_FACTOR=desktop | mobile (default mobile, as the library does)
 */

export const cdpPort = () => activeCdpPort() || cdpBasePort()

/**
 * Cookie header for the page's origin, so Lighthouse audits the signed-in view.
 * @param {import('@playwright/test').Page} page
 * @param {string} url
 * @returns {Promise<Record<string, string> | undefined>}
 */
export async function sessionHeaders (page, url) {
  const cookies = await page.context().cookies(url).catch(() => [])
  if (cookies.length === 0) return undefined
  return { Cookie: cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ') }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} url
 */
export async function lighthouseOptions (page, url) {
  return {
    port: cdpPort(),
    extraHeaders: await sessionHeaders(page, url),
    formFactor: process.env.A11Y_LIGHTHOUSE_FORM_FACTOR === 'desktop' ? 'desktop' : 'mobile'
  }
}
