/**
 * The Chrome DevTools port shared by the Playwright browser and Lighthouse.
 *
 * Each worker launches its own Chromium, so each needs its own port: base port plus the
 * worker index (`support/a11y-browser.js`). The port is recorded per worker process, which
 * is why it lives here rather than in the config: Playwright evaluates the config once, in
 * the main process, and hands the same launch options to every worker.
 */

const DEFAULT_BASE_PORT = 9222

/** First port of the per-worker range. */
export const cdpBasePort = () => Number.parseInt(process.env.A11Y_CDP_PORT ?? '', 10) || DEFAULT_BASE_PORT

let activePort = 0

/** Record the port this worker's browser is listening on. */
export const setActiveCdpPort = (port) => {
  activePort = port
}

/** Port of this worker's browser, or 0 when it was started without one. */
export const activeCdpPort = () => activePort
