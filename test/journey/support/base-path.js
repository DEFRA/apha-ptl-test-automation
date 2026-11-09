/** Keeps a path prefix of the base URL (e.g. /ProficiencyTestingAdmin) when a test goes to a root-relative route. */
export function basePathOf(baseURL) {
  return baseURL ? new URL(baseURL).pathname.replace(/\/+$/, '') : ''
}

export function withBasePath(page, baseURL) {
  const prefix = basePathOf(baseURL)
  if (!prefix) return page
  const goto = page.goto.bind(page)
  page.goto = (url, options) => {
    const keep = typeof url !== 'string' || !url.startsWith('/') || url.toLowerCase().startsWith(`${prefix.toLowerCase()}/`)
    return goto(keep ? url : prefix + url, options)
  }
  return page
}

export const stripBasePath = (pathname, baseURL) => {
  const prefix = basePathOf(baseURL)
  return prefix && pathname.toLowerCase().startsWith(`${prefix.toLowerCase()}/`) ? pathname.slice(prefix.length) : pathname
}
