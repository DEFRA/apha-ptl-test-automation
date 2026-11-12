/* eslint-disable playwright/no-standalone-expect -- playwright-bdd step bodies run inside generated tests */
import { Given, When, Then, test, expect } from '../../support/fixtures.js'
import { internal } from '../../content/internal.js'
import { internalRoles } from '../../support/env.js'

// source: Authorization/PtlPolicies.cs (policy names), Features/Account/AccountController.cs (Access Denied answers 403)

const kindOf = (role) => (role === 'limited' ? 'limited' : 'applicant')

/** Whether an account holding `roles` satisfies `policy`. InvoiceGeneration needs two roles (PtlPolicies.cs). */
const holds = (policy, roles) => {
  if (policy === 'any') return true
  if (policy === 'InvoiceGeneration') return roles.includes('ContractsAdmin') && roles.includes('GenerateInvoices')
  return roles.includes(policy)
}

Given('the account holds the {string} role', async ({ role }, policy) => {
  test.info().skip(!holds(policy, internalRoles(kindOf(role))), `account does not hold ${policy}; set INTERNAL_WEB_ROLES to run this scenario`)
})

Given('a signed-in limited user', async ({ page }) => {
  await page.goto(internal.routes.home)
  const signedIn = new URL(page.url()).hostname !== internal.identityProviderHost
  test.info().skip(!signedIn, 'INTERNAL_WEB_LIMITED_USER / _PASSWORD are not configured')
})

When('the user requests the internal address {string}', async ({ page, state }, path) => {
  const response = await page.goto(path)
  state.path = path
  state.status = response?.status()
})

Then('access to that page matches the roles the account holds', async ({ page, state, role }) => {
  const entry = internal.matrix.find((m) => m.path === state.path)
  expect(entry, `${state.path} is in the role matrix`).toBeTruthy()
  const allowed = holds(entry.policy, internalRoles(kindOf(role)))
  const heading = page.getByRole('heading', { level: 1 }).first()
  if (allowed) {
    expect(state.status, `${entry.policy} held, so ${state.path} should open`).toBeLessThan(400)
    await expect(heading).not.toHaveText(internal.pages.accessDenied.heading)
  } else {
    expect(state.status, `${entry.policy} not held, so ${state.path} should be refused`).toBe(403)
    await expect(heading).toHaveText(internal.pages.accessDenied.heading)
  }
})

Then('the page heading starts with {string}', async ({ page }, start) => {
  await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(new RegExp(`^\\s*${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
})
