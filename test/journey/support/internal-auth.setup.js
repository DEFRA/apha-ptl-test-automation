import fs from 'node:fs'
import { test as setup, expect } from '@playwright/test'
import { internalCredentials, webUrl } from './env.js'
import { internal } from '../content/internal.js'

/**
 * Signs in to PTL.InternalWeb through Microsoft Entra ID once and saves the session to .auth/internal.json.
 * Account: INTERNAL_WEB_APPLICANT_USER / INTERNAL_WEB_APPLICANT_PASSWORD. The account must not require MFA.
 */
setup('authenticate to the internal app via Entra ID', async ({ page }) => {
  const { username, password } = internalCredentials()
  setup.skip(!username || !password, 'INTERNAL_WEB_APPLICANT_USER and INTERNAL_WEB_APPLICANT_PASSWORD are not set; internal journeys cannot sign in.')

  fs.mkdirSync('.auth', { recursive: true })
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

  await expect(home).toBeVisible() // fails here when MFA, a consent prompt or a denied sign-in (NotPermitted) intervenes
  await page.context().storageState({ path: '.auth/internal.json' })
})
