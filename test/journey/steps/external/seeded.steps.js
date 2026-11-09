import { Given, Then, test } from '../../support/fixtures.js'
import { expectSeededText } from '../../assertions/seeded.assertions.js'

export { test }

Given('the seeded customer opens {string}', async ({ page }, route) => {
  await page.goto(route) // source: docs/discovery/crawl.json routes of ProficiencyTestingExternalWeb
})

Then('the page shows the seeded text {string}', async ({ page }, text) => {
  await expectSeededText(page, text) // source: data/seed/apply.sql (participant Lab Code 1300, customer QAL/0432)
})
