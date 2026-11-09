export const PROFILES = ['legacy', 'gds']

/**
 * The active UI profile. Validated at import time: an unknown or misspelt value throws
 * instead of silently falling back to a legacy value on the migrated UI.
 * @type {'legacy' | 'gds'}
 */
export const PROFILE = String(process.env.UI_PROFILE ?? 'legacy').trim().toLowerCase()

if (!PROFILES.includes(PROFILE)) {
  throw new Error(
    `UI_PROFILE="${process.env.UI_PROFILE}" is not a known profile. Use one of: ${PROFILES.join(', ')}.`
  )
}

/**
 * Pick the value for the active UI profile. Every variant object must provide the active
 * profile's key: a missing key is a migration defect, not something to paper over.
 * @template T
 * @param {{ legacy: T, gds: T }} variants
 * @returns {T}
 */
export function byProfile(variants) {
  if (!variants || typeof variants !== 'object') {
    throw new Error(`byProfile expects { legacy, gds }, got ${typeof variants}.`)
  }
  if (!(PROFILE in variants) || variants[PROFILE] === undefined) {
    const given = Object.keys(variants).join(', ') || 'none'
    throw new Error(`byProfile: no "${PROFILE}" variant. Keys given: ${given}.`)
  }
  return variants[PROFILE]
}

/**
 * True when the run is against the migrated GOV.UK Design System UI.
 * @returns {boolean}
 */
export const isGds = () => PROFILE === 'gds'
