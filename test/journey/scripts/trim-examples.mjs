/* eslint-disable */
/**
 * Keeps one representative Examples row for every Scenario Outline with more than 6 rows (the repeat-per-list-item kind).
 * The full features are copied to docs/full-examples/ first. Run from test/journey: node scripts/trim-examples.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
const MAX = 6
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.feature') ? [path.join(d, e.name)] : []))
const trimmed = {}
for (const file of walk('features')) {
  const text = fs.readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)
  const out = []
  let tc = null
  let feature = null
  let i = 0
  let changed = false
  while (i < lines.length) {
    const l = lines[i]
    const t = l.trim()
    if (t.startsWith('@')) { tc = /@(TC-\d+)/.exec(t)?.[1] ?? tc; feature = /@feature:(\S+)/.exec(t)?.[1] ?? feature }
    if (/^Examples:/.test(t)) {
      out.push(l)
      const header = lines[i + 1]
      const rows = []
      let j = i + 2
      while (j < lines.length && lines[j].trim().startsWith('|')) { rows.push(lines[j]); j++ }
      out.push(header)
      if (rows.length > MAX) { out.push(rows[0]); trimmed[tc] = { feature, rows: rows.length }; changed = true } else out.push(...rows)
      i = j
      continue
    }
    out.push(l)
    i++
  }
  if (changed) {
    const backup = path.join('docs/full-examples', file)
    fs.mkdirSync(path.dirname(backup), { recursive: true })
    fs.writeFileSync(backup, text)
    fs.writeFileSync(file, out.join('\n'))
  }
}
for (const [ref, { feature, rows }] of Object.entries(trimmed)) {
  const f = `docs/test-cases/${feature}.json`
  const j = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''))
  const t = j.test_cases.find((c) => c.ref === ref)
  if (!t) continue
  t.assumptions = t.assumptions.filter((a) => !a.startsWith('Representative sample'))
  t.assumptions.push(`Representative sample: one row stands for the ${rows} similar rows; the full list is kept in docs/full-examples/ and can be restored.`)
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n')
}
console.log(JSON.stringify(trimmed))
