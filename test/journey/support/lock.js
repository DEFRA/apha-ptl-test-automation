import fs from 'node:fs'
import path from 'node:path'

const dir = path.resolve('reports', '.locks')

/** Cross-worker mutex so tests that change the same seeded customer or participant never overlap. */
export async function acquireLock(name, { staleMs = 300000, timeoutMs = 900000 } = {}) {
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${name}.lock`)
  const start = Date.now()
  for (;;) {
    try {
      fs.writeFileSync(file, String(Date.now()), { flag: 'wx' })
      return () => fs.rmSync(file, { force: true })
    } catch {
      try {
        if (Date.now() - Number(fs.readFileSync(file, 'utf8')) > staleMs) fs.rmSync(file, { force: true })
      } catch {
        // the holder released it between the two calls
      }
      if (Date.now() - start > timeoutMs) throw new Error(`Lock ${name} was not released in time`)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
}

const held = new WeakMap()

/** Take a named lock once per test (owner is the page) and release it in the test cleanup. */
export async function holdLock(owner, name, cleanup) {
  const names = held.get(owner) ?? new Set()
  if (names.has(name)) return
  names.add(name)
  held.set(owner, names)
  cleanup(await acquireLock(name))
}
