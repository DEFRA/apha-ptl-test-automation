import fs from 'node:fs'
import { test as setup, expect } from '@playwright/test'
import { internalCredentials, webUrl } from './env.js'
import { internal } from '../content/internal.js'

/**
 * Signs in to PTL.InternalWeb through Microsoft Entra ID and saves each session to .auth/<kind>.json.
 * applicant: INTERNAL_WEB_APPLICANT_USER / _PASSWORD (the main test account).
 * limited:   INTERNAL_WEB_LIMITED_USER / _PASSWORD (optional low-privilege account for role-refusal scenarios).
 * Accounts must not require MFA. A missing optional (limited) account writes an empty session so dependent projects still start.
 */
const EMPTY_STATE = { cookies: [], origins: [] }

for (const kind of ['applicant', 'limited']) {
  const file = kind === 'applicant' ? '.auth/internal.json' : '.auth/limited.json'

  setup(`authenticate to the internal app as ${kind}`, async ({ page }) => {
    fs.mkdirSync('.auth', { recursive: true })
    const { username, password } = internalCredentials(kind)
    if ((!username || !password) && kind === 'applicant') {
      throw new Error('INTERNAL_WEB_APPLICANT_USER and INTERNAL_WEB_APPLICANT_PASSWORD must both be set in .env (or as pipeline variables).')
    }
    if (!username || !password) {
      fs.writeFileSync(file, JSON.stringify(EMPTY_STATE))
      setup.info().annotations.push({ type: 'not-configured', description: `INTERNAL_WEB_${kind.toUpperCase()}_USER/_PASSWORD not set` })
      return
    }

    await page.goto(`${webUrl()}${internal.routes.home}`) // source: Features/Home/HomeController.cs

    // source: Microsoft Entra sign-in page (login.microsoftonline.com)
    await page.getByRole('textbox', { name: /email|phone|skype|sign in/i }).fill(username)
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('textbox', { name: /password/i }).fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    const staySignedIn = page.getByRole('button', { name: 'Yes' })
    const home = page.getByRole('heading', { level: 1, name: internal.pages.home.heading })
    await expect(staySignedIn.or(home)).toBeVisible({ timeout: 60000 })
    if (await staySignedIn.isVisible()) await staySignedIn.click()

    await expect(home).toBeVisible() // fails here for MFA, a consent prompt or a denied sign-in (NotPermitted)
    await page.context().storageState({ path: file })
  })
}

