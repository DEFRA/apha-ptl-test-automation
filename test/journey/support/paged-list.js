/** Walks a paged, sorted list until a row containing `text` is found; leaves the page on that row's page. */
export async function openPageWithItem(page, path, text, { maxPages = 20 } = {}) {
  for (let n = 1; n <= maxPages; n++) {
    await page.goto(`${path}${path.includes('?') ? '&' : '?'}page=${n}`)
    if (await page.locator('main tr', { hasText: text }).count()) return true
    if ((await page.locator('main table tbody tr').count()) === 0) return false
  }
  return false
}
