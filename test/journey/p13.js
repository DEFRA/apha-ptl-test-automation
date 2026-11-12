import 'dotenv/config'
import { chromium } from '@playwright/test'
const base = process.env.PROFICIENCY_TESTING_WEB_URL.replace(/\/$/, '')
const b = await chromium.launch(); const c = await b.newContext({ storageState: '.auth/internal.json' }); const p = await c.newPage()
await p.goto(base + '/Contract/ExportContracts')
const row = p.locator('main tbody tr', { hasText: 'QATContractTemplate.docx' })
if (await row.count()) { await row.getByRole('button', { name: /Delete/ }).click(); await p.getByRole('button', { name: 'Delete', exact: true }).click(); await p.waitForLoadState('load') }
await p.goto(base + '/Contract/ExportContracts')
console.log('rows now:', JSON.stringify(await p.locator('main tbody tr').evaluateAll(r => r.map(x => (x.className.includes('selected') ? '*' : '') + x.cells[0].textContent.trim()))))
await b.close()
