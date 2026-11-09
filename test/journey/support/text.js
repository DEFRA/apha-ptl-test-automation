/**
 * Text helpers that keep assertions identical across the legacy UI and GOV.UK Frontend.
 *
 * GOV.UK decorates text with visually hidden spans, for example an error message is
 * `<span class="govuk-visually-hidden">Error:</span> Enter an email address`. Playwright
 * matches the rendered text, so a bare string compare passes on legacy and fails on GDS.
 */

const HIDDEN_PREFIX = /^(?:error|warning|information):\s*/i

/** Escape a string for use inside a RegExp. */
export const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Collapse whitespace and drop a leading `Error:`/`Warning:` label.
 * Use for script-side comparisons, not for DOM assertions.
 * @param {string} value
 * @returns {string}
 */
export const visibleText = (value) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(HIDDEN_PREFIX, '')

/**
 * Anchored, whitespace-tolerant pattern that ignores a leading visually hidden label.
 * Use with `toHaveText`, `toContainText` or `getByRole({ name })`.
 * @param {string} value expected visible text
 * @returns {RegExp}
 */
export const textPattern = (value) => new RegExp(`^\\s*(?:error:|warning:|information:)?\\s*${escapeRegExp(visibleText(value))}\\s*$`, 'i')

/**
 * Unanchored pattern for names that legitimately continue after the visible text,
 * such as `Continue` rendered as `Continue to check your answers`.
 * @param {string} value
 * @returns {RegExp}
 */
export const namePattern = (value) => new RegExp(`\\b${escapeRegExp(visibleText(value))}\\b`, 'i')

/**
 * True when the two strings are equal after normalisation. Handy in unit-style checks.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export const sameText = (a, b) => visibleText(a) === visibleText(b)
