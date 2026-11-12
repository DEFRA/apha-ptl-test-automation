// Builds docs/internal/route-inventory.json from PTL.InternalWeb controllers. Read-only on the source repo.
import fs from 'node:fs'
import path from 'node:path'

const src = process.env.PTL_APPS_SRC ?? 'C:/Dev/apha-ptl-apps-main/src/PTL.InternalWeb'
const out = path.resolve('docs/internal/route-inventory.json')

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return /^(obj|bin|wwwroot)$/.test(e.name) ? [] : walk(p)
    return p.endsWith('.cs') ? [p] : []
  })

const controllers = {}
for (const file of walk(src).filter((f) => /Controller[^\\/]*\.cs$/.test(f))) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  let cls = null
  let attrs = []
  lines.forEach((line, i) => {
    const t = line.trim()
    if (t.startsWith('[')) { attrs.push(t); return }
    const c = t.match(/class (\w+Controller)\b/)
    if (c) {
      cls = c[1].replace(/Controller$/, '')
      controllers[cls] ??= { files: [], classAuthorize: [], actions: [] }
      controllers[cls].files.push(`${path.relative(src, file).replace(/\\/g, '/')}:${i + 1}`)
      controllers[cls].classAuthorize.push(...attrs.filter((a) => /Authorize/.test(a)))
      attrs = []
      return
    }
    const a = t.match(/^public\s+(?:virtual\s+|override\s+)?(?:async\s+)?(?:Task<)?(?:I?ActionResult|ViewResult|RedirectToActionResult|FileResult|\w*Result)>?\s+(\w+)\s*\(/)
    if (a && cls) {
      const verb = attrs.find((x) => /Http(Get|Post)/.test(x))?.match(/Http(Get|Post)/)[1].toUpperCase() ?? 'GET'
      controllers[cls].actions.push({
        action: a[1],
        verb,
        route: attrs.find((x) => /Http\w+\("/.test(x))?.match(/\("([^"]*)"/)?.[1] ?? null,
        authorize: attrs.filter((x) => /Authorize/.test(x)),
        source: `${path.relative(src, file).replace(/\\/g, '/')}:${i + 1}`
      })
    }
    if (t && !t.startsWith('//')) attrs = []
  })
}

fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify(controllers, null, 2))
const total = Object.values(controllers).reduce((n, c) => n + c.actions.length, 0)
console.log(`${Object.keys(controllers).length} controllers, ${total} actions -> ${out}`)
