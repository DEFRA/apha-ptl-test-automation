import { Given, expect } from '../../support/fixtures.js'
import { credentials, loginUrl } from '../../support/env.js'

// Without credentials (local debug SSO bypass) the app signs the user in itself, so there is nothing to do.
Given('the customer is logged in', async ({ page }) => {
  const { username, password } = credentials('applicant')
  if (!username || !password) return

  await page.goto(loginUrl())
  await page.getByLabel('Username').fill(username) // source: crawl https://uat-science.apha.gov.uk/VLAServices/Login.aspx
  await page.getByLabel('Password', { exact: true }).fill(password) // source: same page
  await page.getByRole('button', { name: 'Login' }).click() // source: same page
  await expect(page.getByText('You have successfully logged in')).toBeVisible() // source: same page after login; the URL stays Login.aspx
})
