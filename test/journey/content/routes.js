import { byProfile } from '../support/profiles.js'

/**
 * Routes are used for navigation only (goto, expected destination). Never assert on the URL of
 * the page you are already on: identify pages by their h1 (skill gds-migration-resilience,
 * Rule 5). GDS changes the URL structure and the page count.
 *
 * Two entries only; add one per screen during discovery.
 */
export const routes = {
  start: byProfile({ legacy: '/Default.aspx', gds: '/' }), // source: CHANGE-ME
  signIn: byProfile({ legacy: '/Login.aspx', gds: '/sign-in' }) // source: CHANGE-ME
}

/** Page identity. Assert these, not URLs. */
export const pages = {
  start: { heading: byProfile({ legacy: 'Apply for a licence', gds: 'Apply for a licence' }) } // source: CHANGE-ME
}
