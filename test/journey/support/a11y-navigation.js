import { scanPage } from './a11y.js'

/**
 * Navigation-driven accessibility scanning.
 *
 * Every page the tests visit is audited automatically. Nothing in a step, flow or page
 * object has to call `scanPage()`/`analyse()` after a navigation: this module listens to
 * Playwright's navigation lifecycle and runs the existing deduplicated WCAG scan when a
 * navigation settles.
 *
 * What counts as a navigation:
 *   - `page.goto`, `page.reload`, `page.goBack`, `page.goForward`
 *   - `page.waitForURL`, `page.waitForNavigation` (legacy, when present)
 *   - the `framenavigated` event on the main frame, and the `load` event
 *   - client-side route changes that `waitForURL` observes
 *
 * One navigation produces several signals (the call resolving, `framenavigated`, `load`).
 * Each signal queues the page, but the queue skips a URL that is already being scanned or
 * was already analysed, so a page is audited once. `support/a11y.js` still skips a route and
 * template already scanned earlier in the run, across workers.
 *
 * Environment:
 *   A11Y_SCAN=false            disable navigation-driven scanning entirely
 *   A11Y_NAV_SETTLE_MS=0       extra wait after load for client-rendered pages to settle
 */

const DEFAULT_SETTLE_MS = 0
const FLUSH_TIMEOUT_MS = Number.parseInt(process.env.A11Y_NAV_FLUSH_TIMEOUT_MS ?? '15000', 10) || 15000

/** Methods that represent a navigation or a wait for one. */
const NAVIGATION_METHODS = [
  'goto',
  'reload',
  'goBack',
  'goForward',
  'waitForURL',
  'waitForNavigation'
]

const isEnabled = () => process.env.A11Y_SCAN !== 'false'

const settleMs = () => {
  const configured = process.env.A11Y_NAV_SETTLE_MS
  if (configured === undefined) return DEFAULT_SETTLE_MS
  const parsed = Number.parseInt(configured, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SETTLE_MS
}

/**
 * @typedef {object} NavigationScanner
 * @property {() => Promise<void>} flush Waits for queued scans and rethrows any failure.
 * @property {() => void} stop Removes the hooks; no further scans are queued.
 * @property {() => { navigations: number, analysed: number, duplicates: number, failures: number }} stats
 */

/** Scanners by page, so a landing assertion can wait for the audit without calling analyse. */
const scanners = new WeakMap()

/**
 * Wait until the automatic scan for the page the test is on has finished. `expectPageLoaded`
 * calls this after its heading assertion, which is what stops the next navigation from
 * pre-empting the audit of the page just reached.
 * @param {import('@playwright/test').Page} page
 */
export async function settleA11y(page) {
  await scanners.get(page)?.settle()
}

/** Scanner used when scanning is disabled, so callers never need a null check. */
const inactiveScanner = () => ({
  flush: async () => {},
  stop: () => {},
  stats: () => ({ navigations: 0, analysed: 0, duplicates: 0, failures: 0 })
})

/**
 * Watch a page and analyse every navigation it makes.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ settleMs?: number, enabled?: boolean, variant?: string, role?: string }} [options]
 * @returns {NavigationScanner}
 */
export function installNavigationScanner (page, options = {}) {
  if (!(options.enabled ?? isEnabled())) return inactiveScanner()

  const settleDelay = options.settleMs ?? settleMs()
  const variant = options.variant ?? 'default'
  const role = options.role ?? 'anonymous'

  /** @type {Set<import('@playwright/test').Page>} */
  const watched = new Set()
  /** @type {Map<import('@playwright/test').Page, { onFrameNavigated: Function, onLoad: Function }>} */
  const handlers = new Map()
  /** @type {Map<import('@playwright/test').Page, string>} */
  const lastAnalysedUrl = new Map()
  /** @type {Set<string>} */
  const inFlight = new Set()
  /** @type {Set<string>} */
  const queued = new Set()
  /** @type {Error[]} */
  const failures = []
  const counters = { navigations: 0, analysed: 0, duplicates: 0, failures: 0 }

  let chain = Promise.resolve()
  let stopped = false

  const pageIds = new WeakMap()
  let nextPageId = 0
  const idFor = (target) => {
    if (!pageIds.has(target)) pageIds.set(target, ++nextPageId)
    return pageIds.get(target)
  }

  /** Serialise scans: one axe run at a time keeps the page and the report stable. */
  const enqueue = (task) => {
    chain = chain.then(task).catch((error) => {
      counters.failures += 1
      failures.push(error instanceof Error ? error : new Error(String(error)))
    })
    return chain
  }

  /**
   * Analyse the page once for its current URL.
   * @param {import('@playwright/test').Page} target
   */
  const analyse = async (target) => {
    if (stopped || target.isClosed()) return

    const url = target.url()
    if (!url || url === 'about:blank') return

    const key = `${idFor(target)}|${url}`
    if (inFlight.has(key) || lastAnalysedUrl.get(target) === url) {
      counters.duplicates += 1
      return
    }

    inFlight.add(key)
    counters.navigations += 1
    try {
      const outcome = await scanPage(target, { variant, role })
      lastAnalysedUrl.set(target, url)
      if (outcome?.scanned) counters.analysed += 1
      else counters.duplicates += 1
    } catch (error) {
      // A navigation during the scan destroys the execution context, even when it ends on the same URL
      // (form post, redirect back). The new document has its own signal, so drop this one.
      if (target.isClosed() || target.url() !== url) return
      if (/execution context was destroyed|navigation/i.test(error?.message ?? '')) return
      throw error
    } finally {
      inFlight.delete(key)
    }
  }

  /**
   * Wait for the document the signal referred to, then scan the page the navigation ended on.
   * If the page has already moved on, queue the new page instead of scanning the wrong one.
   * @param {import('@playwright/test').Page} target
   */
  const analyseWhenSettled = async (target) => {
    if (stopped || target.isClosed()) return

    const url = target.url()
    if (!url || url === 'about:blank') return

    await target.waitForLoadState('load', { timeout: 5000 }).catch(() => {})

    if (settleDelay > 0) await new Promise((resolve) => setTimeout(resolve, settleDelay))

    if (stopped || target.isClosed()) return
    if (target.url() !== url) {
      schedule(target)
      return
    }

    await analyse(target)
  }

  /** Queue the page once for its current URL; the rest of a navigation's signals are dropped. */
  const schedule = (target) => {
    if (stopped || target.isClosed()) return

    const key = `${idFor(target)}|${target.url()}`
    if (queued.has(key)) {
      counters.duplicates += 1
      return
    }

    queued.add(key)
    enqueue(() => analyseWhenSettled(target).finally(() => queued.delete(key)))
  }

  /** @param {import('@playwright/test').Page} target */
  const watch = (target) => {
    if (watched.has(target)) return
    watched.add(target)

    const onFrameNavigated = (frame) => {
      if (frame === target.mainFrame()) schedule(target)
    }
    const onLoad = () => schedule(target)

    target.on('framenavigated', onFrameNavigated)
    target.on('load', onLoad)
    handlers.set(target, { onFrameNavigated, onLoad })

    // Wrap the navigation APIs so an awaited navigation is queued even when no event fires,
    // for example a client-side route change observed only by waitForURL.
    for (const method of NAVIGATION_METHODS) {
      const original = target[method]
      if (typeof original !== 'function') continue

      const bound = original.bind(target)
      target[method] = async (...args) => {
        const result = await bound(...args)
        schedule(target)
        return result
      }
      target[method].__a11yOriginal = original
    }
  }

  const onNewPage = (newPage) => watch(newPage)

  watch(page)
  const context = page.context()
  context.on('page', onNewPage)

  /** Queue the current page of every watched page and wait for all queued scans. */
  const settle = async () => {
    for (const target of watched) {
      if (target.isClosed()) continue
      await target.waitForLoadState('load', { timeout: 5000 }).catch(() => {})
      enqueue(() => analyse(target))
    }

    return await Promise.race([
      chain,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`A11y navigation flush timed out after ${FLUSH_TIMEOUT_MS}ms`)), FLUSH_TIMEOUT_MS)
      })
    ])
  }

  /** Wait for in-flight scans, then fail the test with the first enforcement error. */
  const flush = async () => {
    await settle().catch((error) => {
      if (error instanceof Error && error.message.includes('A11y navigation flush timed out')) {
        console.warn(`a11yNavigation flush: ${error.message}`)
        return
      }
      throw error
    })

    if (failures.length > 0) {
      const [first] = failures.splice(0)
      throw first
    }
  }

  const stop = () => {
    stopped = true

    context.off('page', onNewPage)

    for (const target of watched) {
      const pageHandlers = handlers.get(target)
      if (pageHandlers) {
        target.off('framenavigated', pageHandlers.onFrameNavigated)
        target.off('load', pageHandlers.onLoad)
        handlers.delete(target)
      }

      // Delete the instance-level wrappers so the prototype methods apply again.
      for (const method of NAVIGATION_METHODS) {
        if (target[method]?.__a11yOriginal) delete target[method]
      }
    }

    watched.clear()
  }

  const controller = { settle, flush, stop, stats: () => ({ ...counters }) }
  scanners.set(page, controller)
  return controller
}
