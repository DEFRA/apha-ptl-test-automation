import fs from 'node:fs'
import path from 'node:path'
import { resetA11y } from './a11y.js'

export default async function globalSetup() {
  resetA11y()
  fs.rmSync(path.resolve('reports', '.locks'), { recursive: true, force: true }) // a killed run must not leave a lock that blocks the next one
}
