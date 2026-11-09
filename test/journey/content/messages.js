import { byProfile } from '../support/profiles.js'

/**
 * Validation and status messages. Two examples only; add one per message the journeys assert.
 *
 * Assert these with `textPattern()` from support/text.js, never with a bare string: GOV.UK
 * prefixes inline errors with a visually hidden "Error:" label, so a plain comparison passes on
 * legacy and fails on GDS.
 */
export const messages = {
  errorSummaryTitle: byProfile({ legacy: 'There is a problem', gds: 'There is a problem' }), // source: CHANGE-ME
  emailRequired: byProfile({ legacy: 'Enter an email address', gds: 'Enter an email address' }) // source: CHANGE-ME
}
