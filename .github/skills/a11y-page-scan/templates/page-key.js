import { createHash } from 'node:crypto'

const ID_LIKE = [
  /^\d+$/,
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  /^[0-9a-f]{24}$/i,
  /^[A-Za-z]{2,5}-?\d{3,}$/,
  /^(?=.*\d)(?=.*[A-Za-z])[A-Za-z0-9_-]{16,}$/
]

export const hash = (value) => createHash('sha1').update(value).digest('hex').slice(0, 16)

/**
 * Normalise a URL to a route key: lower-case, no trailing slash, id-like segments become ":id".
 * Only query parameters listed in keepParams are kept (legacy apps often select views by query).
 * @param {string} url
 * @param {{ keepParams?: string[] }} [options]
 * @returns {string}
 */
export function normaliseRoute(url, { keepParams = [] } = {}) {
  const u = new URL(url, 'http://placeholder.invalid')
  const path = u.pathname
    .toLowerCase()
    .split('/')
    .filter(Boolean)
    .map((segment) => (ID_LIKE.some((re) => re.test(segment)) ? ':id' : segment))
    .join('/')
  const query = keepParams
    .filter((name) => u.searchParams.has(name))
    .sort()
    .map((name) => `${name}=${u.searchParams.get(name)}`)
    .join('&')
  return `/${path}${query ? `?${query}` : ''}`
}

/**
 * Fingerprint a page template from its structure, ignoring numbers and content.
 * @param {{ h1: string, landmarks: string[], controls: string[] }} facts
 * @returns {string}
 */
export function fingerprint({ h1, landmarks, controls }) {
  const counts = {}
  for (const control of controls) counts[control] = (counts[control] ?? 0) + 1
  return hash(JSON.stringify({
    h1: h1.trim().toLowerCase().replace(/\d+/g, '#'),
    landmarks: [...new Set(landmarks)].sort(),
    controls: Object.entries(counts).sort()
  }))
}
