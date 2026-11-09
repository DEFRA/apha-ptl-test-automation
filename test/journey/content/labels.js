import { byProfile } from '../support/profiles.js'

/**
 * Every visible label the tests touch, keyed by meaning, never by text.
 *
 * These four are the minimum the scaffold needs: `continue` for the example journey, and the
 * sign-in and cookie labels for `support/auth.setup.js`. Replace them during discovery, and add
 * one entry per label the journeys touch — citing where you saw it.
 *
 * Duplicate a value across profiles even when it is identical today: that duplication is the
 * record that the string is in scope for the GDS migration, and it is what makes a silent
 * fallback impossible.
 */
export const labels = {
  continue: byProfile({ legacy: 'Submit', gds: 'Continue' }), // source: CHANGE-ME e.g. src/views/details.njk:40
  email: byProfile({ legacy: 'Email address', gds: 'Email address' }) // source: CHANGE-ME
}

export const auth = {
  username: byProfile({ legacy: 'Username', gds: 'Username' }), // source: CHANGE-ME
  password: byProfile({ legacy: 'Password', gds: 'Password' }), // source: CHANGE-ME
  submit: byProfile({ legacy: 'Sign in', gds: 'Sign in' }) // source: CHANGE-ME
}

export const cookieBanner = {
  accept: byProfile({ legacy: 'Accept cookies', gds: 'Accept analytics cookies' }), // source: CHANGE-ME
  reject: byProfile({ legacy: 'Reject cookies', gds: 'Reject analytics cookies' }), // source: CHANGE-ME
  hide: byProfile({ legacy: 'Close', gds: 'Hide cookie message' }) // source: CHANGE-ME
}

export const skipLink = {
  label: byProfile({ legacy: 'Skip to content', gds: 'Skip to main content' }) // source: CHANGE-ME
}
