#!/usr/bin/env node
/**
 * Grounding check: every endpoint, page-object locator and content-map entry must cite the
 * source it came from, with a `// source:` comment. Invented routes and labels are the
 * most expensive failure mode for a generated pack, so this is enforced, not sampled.
 *
 * Convention: the comment goes on the same line as the site, or on the line directly above it,
 * and one marker grounds exactly one site. That keeps the rule unambiguous to write and to check.
 *
 * Run from test/journey:
 *   node scripts/check-grounding.js           report and exit 1 when markers are missing
 *   node scripts/check-grounding.js --json    machine-readable output
 *
 * Exempt files are listed in docs/grounding-allow.json as glob-free relative paths
 * (for example "pages/base.page.js"), for scaffolds and generic helpers.
 */
import fs from 'node:fs'
import path from 'node:path'

const JSON_OUT = process.argv.includes('--json')
const MARKER = /\/\/\s*source:/i
const ALLOW = path.join('docs', 'grounding-allow.json')

const RULES = [
  {
    name: 'api endpoint',
    dir: 'api',
    pattern: /\b(?:request|api|this\.request)\.(get|post|put|patch|delete|head)\s*\(/i
  },
  {
    name: 'page locator',
    dir: 'pages',
    pattern: /^\s*(get\s+\w+\s*\(\s*\)\s*\{|async\s+\w+\s*\()/
  },
  {
    name: 'content entry',
    dir: 'content',
    pattern: /^\s{2}\w+\s*:/
  }
]

const allowed = new Set(
  fs.existsSync(ALLOW) ? JSON.parse(fs.readFileSync(ALLOW, 'utf8')).map((p) => p.replace(/\\/g, '/')) : []
)

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith('.js')).map((f) => path.join(dir, String(f)))
    : []

const findings = []
let required = 0
let exempt = 0

for (const rule of RULES) {
  for (const file of walk(rule.dir)) {
    const rel = file.replace(/\\/g, '/')
    if (allowed.has(rel)) { exempt += 1; continue }
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
    let ownMarkerLine = -1
    let claimedBy = -1
    lines.forEach((line, index) => {
      const isCommentOnly = /^\s*(\/\/|\*|\/\*)/.test(line)
      if (MARKER.test(line) && isCommentOnly) ownMarkerLine = index
      if (!rule.pattern.test(line) || isCommentOnly) return
      required += 1
      const inline = MARKER.test(line)
      const above = ownMarkerLine >= 0 && index - ownMarkerLine === 1 && claimedBy !== ownMarkerLine
      if (inline || above) {
        if (above && !inline) claimedBy = ownMarkerLine
        return
      }
      findings.push({ file: `${rel}:${index + 1}`, rule: rule.name, text: line.trim().slice(0, 100) })
    })
  }
}

const summary = { required, exempt, missing: findings.length, findings }
if (JSON_OUT) {
  console.log(JSON.stringify(summary, null, 2))
} else {
  console.log(`Grounding: ${required} sites checked, ${exempt} excused file(s), ${findings.length} without a // source: comment`)
  for (const f of findings) console.log(`PROBLEM: ${f.file} (${f.rule}) has no // source: comment: ${f.text}`)
  if (findings.length) {
    console.log(`Add "// source: <path>:<line>" or "// source: <route>" above each site, or list the file in ${ALLOW}.`)
  }
}
process.exit(findings.length ? 1 : 0)
