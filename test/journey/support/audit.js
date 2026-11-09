/** Saving some records opens Audit.aspx, which asks for a reason before the change is stored. */
export async function confirmAuditIfShown(page, reason = 'E2E journey test') {
  await page.waitForLoadState('load')
  if (!/\/Audit\.aspx/i.test(page.url())) return
  await page.locator('[id$=TextboxAuditWhy]').fill(reason) // source: app/ProficiencyTestingWeb/Audit.aspx TextboxAuditWhy
  await Promise.all([page.waitForURL((url) => !/\/Audit\.aspx/i.test(url.pathname)), page.locator('[id$=BtnSave]').click()]) // source: app/ProficiencyTestingWeb/Audit.aspx BtnSave
  await page.waitForLoadState('load')
}
