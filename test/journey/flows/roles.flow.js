// The user name is stored with a doubled backslash; E2E_ADMIN_ACCOUNT overrides the local account (e.g. ns0000314 on Pre)
const ACCOUNT = (process.env.E2E_ADMIN_ACCOUNT ?? 'ns000134').replace(/^dt2\\+/i, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const OWN = new RegExp('^\\s*dt2\\\\+' + ACCOUNT, 'i') // source: probe 2026-11-03 /Admin/UserRoles.aspx
const OPTIONAL_ROLES = ['Contracts Admin', 'Scheme Admin', 'Scheduling', 'Internal User', 'Test Consultant', 'Assessor', 'Results Sign-off', 'Support', 'Generate Invoices', 'Override Schemes'] // source: probe 2026-11-03 /Admin/UserRoles.aspx headers

export const optionalRoles = OPTIONAL_ROLES

export async function openRoles(page) {
  await page.goto('/Admin/UserRoles.aspx') // source: app/ProficiencyTestingWeb/Admin/UserRoles.aspx
}

async function roleBox(page, role) {
  const headers = (await page.locator('th').allInnerTexts()).map((h) => h.trim()) // source: probe 2026-11-03 /Admin/UserRoles.aspx headers
  const index = headers.indexOf(role)
  if (index < 0) throw new Error(`Role column ${role} was not found`)
  const row = page.locator('tr').filter({ hasText: OWN }).last() // source: probe 2026-11-03 own row
  return row.locator(':scope > td').nth(index).locator('input[type=checkbox]') // source: probe 2026-11-03 role checkbox ids
}

export async function roleIsTicked(page, role) {
  return (await roleBox(page, role)).isChecked()
}

/** Tick or untick a role for the signed-in admin; the page saves at once and signs the user in again. */
export async function setOwnRole(page, role, wanted) {
  await openRoles(page)
  const box = await roleBox(page, role)
  if ((await box.isChecked()) === wanted) return false
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('UserRoles') && response.request().method() === 'POST'), // the checkbox posts back after a short delay
    box.click() // source: app/ProficiencyTestingWeb/Admin/UserRoles.aspx.vb:46 (CheckBoxCheckChanged)
  ])
  await page.waitForLoadState('networkidle')
  return true
}



/** Ticked state of every optional role of the signed-in admin, so a test can put them back. */
export async function snapshotRoles(page) {
  await openRoles(page)
  const state = {}
  for (const role of optionalRoles) state[role] = await roleIsTicked(page, role)
  return state
}

export async function restoreRoles(page, state) {
  await applyRoles(page, state)
}

/** Set every listed role in one visit of Manage Roles; roles that already match cost nothing. */
export async function applyRoles(page, wanted) {
  await openRoles(page)
  for (const [role, value] of Object.entries(wanted)) {
    const box = await roleBox(page, role)
    if ((await box.isChecked()) === value) continue
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('UserRoles') && response.request().method() === 'POST'), // the checkbox posts back after a short delay
      box.click() // source: app/ProficiencyTestingWeb/Admin/UserRoles.aspx.vb:46 (CheckBoxCheckChanged)
    ])
    await page.waitForLoadState('networkidle')
  }
}

export const allRoles = (value) => Object.fromEntries(optionalRoles.map((role) => [role, value]))

