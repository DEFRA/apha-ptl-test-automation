import fs from 'node:fs'
import path from 'node:path'
import {
  getHtmlPerformanceMetrics,
  getHtmlReportByCategory,
  getHtmlReportByGuideLine,
  getJsonReport,
  resetWcagResult,
  wcagResult
} from 'wcag-js-v2'

export const WCAG_REPORT_DIR = path.resolve(process.env.A11Y_WCAG_REPORT_DIR ?? 'reports/a11y')

const STATE_DIR = path.join(WCAG_REPORT_DIR, '.state')

const REPORT_FILES = [
  'accessibility_json_report_latest.json',
  'accessibility_category_latest.html',
  'accessibility_guideline_latest.html',
  'performance_html_report_latest.html'
]

/** Remove the previous run's worker state and report files. Call from global setup. */
export function resetWcagReports() {
  fs.rmSync(STATE_DIR, { recursive: true, force: true })
  for (const fileName of REPORT_FILES) fs.rmSync(path.join(WCAG_REPORT_DIR, fileName), { force: true })
}

/**
 * Snapshot this worker's run state for the global teardown to merge.
 * @param {number} workerIndex
 */
export function persistWcagState(workerIndex) {
  fs.mkdirSync(STATE_DIR, { recursive: true })
  const snapshot = {
    workerIndex,
    startDateTime: wcagResult.startDateTime,
    isErrorFound: wcagResult.isErrorFound,
    visitedPageUrls: [...wcagResult.visitedPageUrls],
    axeViolations: wcagResult.axeViolations,
    axeStatistics: wcagResult.axeStatistics,
    lighthouseViolations: wcagResult.lighthouseViolations,
    lighthouseStatistics: wcagResult.lighthouseStatistics,
    lighthousePerformanceMetrics: wcagResult.lighthousePerformanceMetrics
  }
  fs.writeFileSync(path.join(STATE_DIR, `worker-${workerIndex}-${process.pid}.json`), JSON.stringify(snapshot))
}

/** @returns {object[]} */
function readWorkerStates() {
  if (!fs.existsSync(STATE_DIR)) return []
  return fs
    .readdirSync(STATE_DIR)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => JSON.parse(fs.readFileSync(path.join(STATE_DIR, file), 'utf8')))
}

/** Rebuild the library run state from every worker's snapshot; the first snapshot to claim a key wins. */
function hydrateWcagState(states) {
  resetWcagResult()

  // One set per collection: a page key appears in each of them, so a shared set would drop entries.
  const seen = {
    visited: new Set(),
    axeViolations: new Set(),
    axeStatistics: new Set(),
    lighthouseViolations: new Set(),
    lighthouseStatistics: new Set(),
    lighthouseMetrics: new Set()
  }

  const add = (set, key, apply) => {
    if (!key || set.has(key)) return
    set.add(key)
    apply()
  }

  for (const state of states) {
    if (!wcagResult.startDateTime && state.startDateTime) wcagResult.startDateTime = state.startDateTime
    wcagResult.isErrorFound = wcagResult.isErrorFound || state.isErrorFound

    for (const [url, title] of state.visitedPageUrls ?? []) {
      add(seen.visited, url, () => wcagResult.visitedPageUrls.set(url, title))
    }
    for (const entry of state.axeViolations ?? []) {
      add(seen.axeViolations, Object.keys(entry)[0], () => wcagResult.axeViolations.push(entry))
    }
    for (const entry of state.lighthouseViolations ?? []) {
      add(seen.lighthouseViolations, Object.keys(entry)[0], () => wcagResult.lighthouseViolations.push(entry))
    }
    for (const statistic of state.axeStatistics ?? []) {
      add(seen.axeStatistics, statistic.url, () => wcagResult.axeStatistics.push(statistic))
    }
    for (const statistic of state.lighthouseStatistics ?? []) {
      add(seen.lighthouseStatistics, statistic.url, () => wcagResult.lighthouseStatistics.push(statistic))
    }
    for (const metrics of state.lighthousePerformanceMetrics ?? []) {
      add(seen.lighthouseMetrics, metrics.url, () => wcagResult.lighthousePerformanceMetrics.push(metrics))
    }
  }
}

/**
 * Write the four wcag-js-v2 reports.
 * @param {string} [dir]
 * @returns {Promise<string>} the directory written to
 */
export async function writeWcagReports (dir = WCAG_REPORT_DIR) {
  const reports = [
    [REPORT_FILES[0], await getJsonReport()],
    [REPORT_FILES[1], await getHtmlReportByCategory()],
    [REPORT_FILES[2], await getHtmlReportByGuideLine()],
    [REPORT_FILES[3], await getHtmlPerformanceMetrics()]
  ]

  fs.mkdirSync(dir, { recursive: true })
  for (const [fileName, content] of reports) {
    fs.writeFileSync(path.join(dir, fileName), content)
  }

  const shown = path.relative(process.cwd(), dir) || '.'
  console.log(`wcag-js-v2: ${reports.length} reports written to ./${shown}/`)
  return dir
}

/**
 * Global teardown entry point: merge every worker's scans and write the reports once, after
 * all tests have finished.
 * @param {string} [dir]
 */
export async function writeWcagReportsFromWorkers(dir = WCAG_REPORT_DIR) {
  const states = readWorkerStates()
  if (states.length === 0) {
    console.log('wcag-js-v2: no scanned pages recorded, reports skipped')
    return null
  }

  hydrateWcagState(states)
  await writeWcagReports(dir)
  fs.rmSync(STATE_DIR, { recursive: true, force: true })
  return dir
}
