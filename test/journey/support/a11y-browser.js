import { cdpBasePort, setActiveCdpPort } from './a11y-cdp.js'

/**
 * Chromium with a debugging port unique to this worker (`A11Y_CDP_PORT` plus the worker
 * index), so Lighthouse audits the browser that ran the page even with parallel workers.
 * Overrides the built-in `browser` fixture because the worker index only exists in the worker.
 *
 * @type {import('@playwright/test').Fixture<import('@playwright/test').Browser, { playwright: import('@playwright/test').Playwright }, { scope: 'worker' }>}
 */
export const browserWithDebuggingPort = async ({ playwright, browserName }, use, workerInfo) => {
  const configured = workerInfo.project.use.launchOptions ?? {}
  const headless = workerInfo.project.use.headless ?? true
  const args = (configured.args ?? []).filter((arg) => !String(arg).startsWith('--remote-debugging-port'))

  const port = cdpBasePort() + workerInfo.workerIndex
  args.push(`--remote-debugging-port=${port}`)
  setActiveCdpPort(port)

  const browser = await playwright[browserName].launch({ ...configured, headless, args })
  try {
    await use(browser)
  } finally {
    await browser.close()
  }
}
