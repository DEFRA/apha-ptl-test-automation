import fs from 'node:fs'
import path from 'node:path'

const junitFile = path.resolve(process.env.JUNIT_FILE ?? 'reports/junit/results.xml')
const a11yFile = path.resolve(process.env.A11Y_DIR ?? 'reports/a11y', 'a11y-summary.json')
const profile = process.env.UI_PROFILE ?? 'legacy'

const escape = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\|/g, '\\|')
  .replace(/\s+/g, ' ')
  .trim()

function junitSummary() {
  if (!fs.existsSync(junitFile)) return ['## Regression tests', '', `:warning: Missing JUnit file: \`${junitFile}\``, '']
  const xml = fs.readFileSync(junitFile, 'utf8')
  const root = /<testsuites\b[^>]*>/.exec(xml)?.[0] ?? ''
  const value = (name) => Number(new RegExp(`\\b${name}="([^"]*)"`).exec(root)?.[1] ?? 0)
  const total = value('tests')
  const failed = value('failures') + value('errors')
  const skipped = value('skipped')
  return [
    `## Regression tests ${failed ? ':x:' : ':white_check_mark:'}`,
    '',
    '| Profile | Total | Passed | Failed | Skipped |',
    '|---|---:|---:|---:|---:|',
    `| ${escape(profile)} | ${total} | ${Math.max(0, total - failed - skipped)} | ${failed} | ${skipped} |`,
    ''
  ]
}

function a11ySummary() {
  if (!fs.existsSync(a11yFile)) return ['## Accessibility', '', ':warning: No accessibility summary was produced.', '']
  const summary = JSON.parse(fs.readFileSync(a11yFile, 'utf8'))
  return [
    `## Accessibility ${summary.pagesWithViolations ? ':warning:' : ':white_check_mark:'}`,
    '',
    `Analysed **${summary.pagesScanned ?? 0}** page(s); **${summary.pagesWithViolations ?? 0}** page(s) had violations.`,
    `Not visited: **${(summary.notVisitedPages ?? []).length}**. Template-covered: **${(summary.coveredByTemplate ?? []).length}**.`,
    ''
  ]
}

const markdown = [...junitSummary(), ...a11ySummary()].join('\n')
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`)
else console.log(markdown)
