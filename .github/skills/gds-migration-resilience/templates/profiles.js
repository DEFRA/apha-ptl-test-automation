export const PROFILE = process.env.UI_PROFILE ?? 'legacy' // 'legacy' | 'gds'

/**
 * Pick a value for the active UI profile. Falls back to `common`.
 * @template T
 * @param {{ legacy?: T, gds?: T, common?: T }} variants
 * @returns {T}
 */
export const byProfile = (variants) => variants[PROFILE] ?? variants.common
