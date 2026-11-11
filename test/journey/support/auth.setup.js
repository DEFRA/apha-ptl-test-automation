import fs from 'node:fs'
import path from 'node:path'
import { test as setup, expect } from '@playwright/test'
import { credentials, loginUrl, roles, uiBaseUrl } from './env.js'

/**
 * Local runs use the server-side debug SSO bypass, so no sign-in is needed. When
 * EXTERNAL_WEB_<ROLE>_USER and EXTERNAL_WEB_<ROLE>_PASSWORD are set (UAT), the setup signs in on the login page.
 */
const AUTH_DIR = '.auth'

for (const role of roles()) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    fs.mkdirSync(AUTH_DIR, { recursive: true })

    const { username, password } = credentials(role)
    if (username && password) {
      await page.goto(loginUrl())
      await page.getByLabel('Username').fill(username) // source: crawl https://uat-science.apha.gov.uk/VLAServices/Login.aspx
      await page.getByLabel('Password', { exact: true }).fill(password) // source: same page
      await page.getByRole('button', { name: 'Login' }).click() // source: same page
      await expect(page.getByText('You have successfully logged in')).toBeVisible() // source: probe of https://uat-science.apha.gov.uk/VLAServices/Login.aspx after login; the URL stays Login.aspx
      await page.context().storageState({ path: path.join(AUTH_DIR, `${role}.json`) })
      return
    }

    const startUrl = uiBaseUrl().endsWith('/Home.aspx') ? uiBaseUrl() : `${uiBaseUrl()}/Home.aspx`
    await page.goto(startUrl)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    setup.info().annotations.push({
      type: 'auth',
      description: `${role} authenticated via the local debug SSO bypass at ${uiBaseUrl()}`
    })

    await page.context().storageState({ path: path.join(AUTH_DIR, `${role}.json`) })
  })
}
