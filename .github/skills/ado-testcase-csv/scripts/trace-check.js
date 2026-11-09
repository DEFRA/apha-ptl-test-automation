import fs from 'node:fs'
import path from 'node:path'

// Run from test/journey. Flags: --allow-missing (ignore test cases with no scenario yet)
const allowMissing = process.argv.includes('--allow-missing')
const walk = (dir, ext) => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { recursive: true }).filter((f) => f.endsWith(ext)).map((f) => path.join(dir, f))
  : [])

const cases = walk('docs/test-cases', '.json').flatMap((file) =>
  (JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')).test_cases ?? [])
    .map((tc) => ({ ref: tc.ref, title: tc.title, file })))

const scenarios = []
for (const file of walk('features', '.feature')) {
  let tags = []
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const text = line.trim()
    if (text.startsWith('@')) tags.push(...text.split(/\s+/))
    else if (/^Scenario( Outline)?:/.test(text)) {
      scenarios.push({ title: text.replace(/^Scenario( Outline)?:\s*/, ''), refs: tags.filter((t) => /^@TC-\d+$/.test(t)).map((t) => t.slice(1)), file })
      tags = []
    } else if (text && !text.startsWith('#')) tags = []
  }
}

const problems = []
const refs = new Map()
for (const c of cases) {
  if (!c.ref) problems.push(`Test case has no ref: "${c.title}" (${c.file})`)
  else if (refs.has(c.ref)) problems.push(`Duplicate ref ${c.ref}`)
  else refs.set(c.ref, c)
}
const covered = new Set(scenarios.flatMap((s) => s.refs))
if (!allowMissing) for (const [ref, c] of refs) if (!covered.has(ref)) problems.push(`No scenario for ${ref}: "${c.title}"`)
for (const s of scenarios) {
  if (!s.refs.length) problems.push(`Scenario without @TC tag: "${s.title}" (${s.file})`)
  for (const ref of s.refs) {
    const c = refs.get(ref)
    if (!c) problems.push(`Unknown ${ref} on "${s.title}"`)
    else if (!s.title.startsWith(c.title)) problems.push(`Title differs for ${ref}: "${s.title}" vs "${c.title}"`)
  }
}
console.log(`${refs.size} test cases, ${scenarios.length} scenarios, ${problems.length} problems`)
for (const p of problems) console.log('PROBLEM:', p)
process.exit(problems.length ? 1 : 0)
