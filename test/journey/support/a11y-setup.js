import fs from 'node:fs'
import path from 'node:path'
import { resetA11y } from './a11y.js'
import { resetWcagReports } from './a11y-wcag-report.js'

export default async function globalSetup() {
  resetA11y()
  resetWcagReports() // stale worker state and old *_latest reports must not leak into this run
  fs.rmSync(path.resolve('reports', '.locks'), { recursive: true, force: true }) // a killed run must not leave a lock that blocks the next one
}
