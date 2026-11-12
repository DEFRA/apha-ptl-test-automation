import 'dotenv/config' // .env is read here and inherited by the test workers
import { defineConfig } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

/**
 * playwright-bdd generates Playwright tests from features/ + steps/. Without this call the
 * suite silently finds zero tests, which is the most common way a BDD scaffold is wasted.
 */
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  // The fixtures file must be listed here: playwright-bdd reads `test` from it to bind steps
  // to the custom test instance. Omitting it fails with "Can't guess test instance".
  steps: ['support/fixtures.js', 'steps/**/*.js']
})

const ci = !!process.env.CI

const internalUrl = (process.env.PROFICIENCY_TESTING_WEB_URL ?? 'http://localhost:1946').replace(/\/+$/, '') // PTL.InternalWeb, signs in through Microsoft Entra ID

export default defineConfig({
  testDir,
  timeout: 60000,
  forbidOnly: ci,
  grepInvert: /@wip/, // work-in-progress scenarios are generated but never run
  retries: 0,
  globalTimeout: 2 * 60 * 60 * 1000, // a run that is not finished by then stops itself and still writes the HTML, JSON and accessibility reports
  workers: ci ? 2 : 3, // the local ProficiencyTestingWeb site slows down and times out clicks with more parallel users
  fullyParallel: true,
  globalSetup: './support/a11y-setup.js', // clears old scan results
  globalTeardown: './support/a11y-report.js', // builds reports/a11y/a11y-report.html
  outputDir: 'test-results',
  expect: { timeout: 30000 }, // the Assessor pages take 8 to 9 seconds each locally, more when run in parallel
  // The HTML report is written on every run, local or CI; do not override --reporter on the command line without it.
  reporter: [
    ...(ci
      ? [['github'], ['line'], ['junit', { outputFile: process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE ?? 'reports/junit/results.xml' }]]
      : [['list']]),
    ['html', { outputFolder: 'reports/playwright', open: 'never' }],
    ['json', { outputFile: 'reports/playwright/results.json' }]
  ],
  use: {
    baseURL: internalUrl,
    actionTimeout: 30000, // a missing control fails in 30 s instead of waiting for the whole test timeout
    navigationTimeout: 60000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    testIdAttribute: 'data-testid'
  },
  projects: [
    // Signs in to the internal app through Entra ID once and writes .auth/internal.json (INTERNAL_WEB_APPLICANT_USER / INTERNAL_WEB_APPLICANT_PASSWORD).
    {
      name: 'internal-setup',
      testDir: './support',
      testMatch: /internal-auth\.setup\.js/,
      metadata: { role: 'setup' }
    },
    // Internal journeys as a signed-in user.
    {
      name: 'internal',
      testMatch: /features[\\/]internal[\\/]/,
      grep: /@role:internal/,
      grepInvert: /@wip|@manual|@write/,
      dependencies: ['internal-setup'],
      use: { storageState: '.auth/internal.json' },
      metadata: { role: 'internal' }
    },
    // Scenarios that add and remove records share the user's server-side staging, so they run one at a time after the read-only ones.
    {
      name: 'internal-write',
      testMatch: /features[\\/]internal[\\/]/,
      grep: /@write/,
      grepInvert: /@wip|@manual/,
      fullyParallel: false,
      workers: 1,
      dependencies: ['internal'],
      use: { storageState: '.auth/internal.json' },
      metadata: { role: 'internal' }
    },
    // Internal pages that need no sign-in, and the redirect for an unauthenticated visitor.
    {
      name: 'internal-anonymous',
      testMatch: /features[\\/]internal[\\/]/,
      grep: /@role:anonymous/,
      grepInvert: /@wip|@manual/,
      metadata: { role: 'anonymous' }
    }
    // Parked: the external (customer-facing) and legacy admin projects. The features under
    // features/external and features/admin still exist but no project runs them.
  ]
})

