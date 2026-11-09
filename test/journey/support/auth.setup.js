import fs from 'node:fs'
import path from 'node:path'
import { test as setup, expect } from '@playwright/test'
import { roles, uiBaseUrl } from './env.js'

/**
 * For this app, the server-side local debug SSO bypass is the real authentication path.
 * The configured `LocalDebugDisableSso` and `LocalDebugUserTokenId` values are read by the
 * ASP.NET app itself during `Application_AuthenticateRequest`, so there is no UI sign-in flow
 * to automate and no secret credentials are required for the journey setup.
 */
const AUTH_DIR = '.auth'

for (const role of roles()) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    fs.mkdirSync(AUTH_DIR, { recursive: true })

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
