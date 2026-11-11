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

const adminHost = new URL(process.env.PROFICIENCY_TESTING_WEB_URL ?? 'http://localhost:1946').hostname
// Windows authentication: Chromium passes the current Windows identity, so no credentials are read here

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
    baseURL: (process.env.PROFICIENCY_TESTING_EXTERNAL_WEB_URL ?? 'http://localhost:1688').replace(/\/[^/]*\.aspx$/i, ''), // ProficiencyTestingExternalWeb; a page URL such as .../Login.aspx is cut back to the site root
    actionTimeout: 30000, // a missing control fails in 30 s instead of waiting for the whole test timeout
    navigationTimeout: 60000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    testIdAttribute: 'data-testid'
  },
  projects: [
    // Logs in once per role and writes .auth/<role>.json. Add or remove roles here.
    {
      name: 'setup',
      testDir: './support',
      testMatch: /auth\.setup\.js/,
      metadata: { role: 'setup' }
    },
    // Default journey project: every external feature, run as the applicant.
    {
      name: 'journey',
      testMatch: /features[\\/]external[\\/]/,
      dependencies: ['setup'],
      use: { storageState: '.auth/applicant.json' },
      metadata: { role: 'applicant' }
    },
    // Copy this block per additional role, then run with --project=<name>.
    // ProficiencyTestingWeb uses Windows authentication: Chromium passes the current Windows identity.
    {
      name: 'admin',
      teardown: 'admin-crud', // the editable lists run after this project even when some of its tests failed
      timeout: 180000, // slow Assessor pages
      grep: /@role:admin/,
      grepInvert: /@wip|@roles|@feature:admin-crud-lists|@TC-177/, // role changes and the editable lists run alone after this project
      use: {
        baseURL: process.env.PROFICIENCY_TESTING_WEB_URL ?? 'http://localhost:1946', // ProficiencyTestingWeb
        launchOptions: { args: [`--auth-server-allowlist=${adminHost}`] }
      },
      metadata: { role: 'admin' }
    },
    // The editable lists change shared records and redirect to the menu under parallel load, so they run one at a time after the admin project.
    {
      name: 'admin-crud',
      timeout: 900000,
      grep: /@feature:admin-crud-lists|@TC-177/,
      grepInvert: /@wip|@manual/,
      fullyParallel: false,
      use: {
        baseURL: process.env.PROFICIENCY_TESTING_WEB_URL ?? 'http://localhost:1946', // ProficiencyTestingWeb
        launchOptions: { args: [`--auth-server-allowlist=${adminHost}`] }
      },
      metadata: { role: 'admin' }
    },
    // Changes the roles of the signed-in admin, so it runs alone and only after the admin project.
    {
      name: 'admin-roles',
      timeout: 600000,
      grep: /@roles/,
      grepInvert: /@manual/, // SSO environments cannot change roles; these stay as ADO test cases
      fullyParallel: false,
      dependencies: ['admin'],
      use: {
        baseURL: process.env.PROFICIENCY_TESTING_WEB_URL ?? 'http://localhost:1946', // ProficiencyTestingWeb
        launchOptions: { args: [`--auth-server-allowlist=${adminHost}`] }
      },
      metadata: { role: 'admin' }
    },
    // No saved session: login and permission scenarios.
    {
      name: 'anonymous',
      grep: /@role:anonymous/,
      metadata: { role: 'anonymous' }
    }
  ]
})











