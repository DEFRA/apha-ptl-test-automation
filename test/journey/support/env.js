/**
 * The only place that reads configuration. Values are read lazily so that `bddgen`, lint and
 * codegen work without a full environment; a missing value fails when it is used, with a
 * message that says which variable to set.
 */

const read = (name, { fallback, required = true } = {}) => {
  const value = process.env[name] ?? fallback
  if (!value && required) {
    throw new Error(`Missing environment variable ${name}. Copy .env.example to .env and fill it in, or set it in the pipeline.`)
  }
  return value ?? ''
}

/** Local ports of the three applications; override per environment with the named variables. */
export const LOCAL_URLS = {
  ProficiencyTestingWeb: 'http://localhost:1946',
  ProficiencyTestingExternalWeb: 'http://localhost:1688',
  ProficiencyTestingWebServices: 'http://localhost:1935'
}

/** Internal web application (ProficiencyTestingWeb). @returns {string} */
export const webUrl = () =>
  read('PROFICIENCY_TESTING_WEB_URL', { fallback: LOCAL_URLS.ProficiencyTestingWeb }).replace(/\/$/, '')

/** Customer-facing application (ProficiencyTestingExternalWeb). @returns {string} */
export const externalWebUrl = () =>
  read('PROFICIENCY_TESTING_EXTERNAL_WEB_URL', { fallback: LOCAL_URLS.ProficiencyTestingExternalWeb }).replace(/\/$/, '')

/** Web services (ProficiencyTestingWebServices). @returns {string} */
export const webServicesUrl = () =>
  read('PROFICIENCY_TESTING_WEB_SERVICES_URL', { fallback: LOCAL_URLS.ProficiencyTestingWebServices }).replace(/\/$/, '')

/** Kept for callers that need the customer-facing origin. @returns {string} */
export const uiBaseUrl = externalWebUrl

/** REST API under test. Defaults to the web services origin. @returns {string} */
export const apiBaseUrl = () => read('API_BASE_URL', { fallback: webServicesUrl() }).replace(/\/$/, '')

/** `legacy` or `gds`. Kept here so one place documents the profiles. @returns {'legacy'|'gds'} */
export const uiProfile = () => (process.env.UI_PROFILE ?? 'legacy').toLowerCase()

/**
 * Credentials for one role, from `.env` or secret pipeline variables.
 * Never log the return value.
 * @param {string} role
 * @returns {{ username: string, password: string }}
 */
export function credentials(role) {
  const key = role.toUpperCase().replace(/[^A-Z0-9]/g, '_')
  return {
    username: read(`EXTERNAL_WEB_${key}_USER`, { required: false }),
    password: read(`EXTERNAL_WEB_${key}_PASSWORD`, { required: false })
  }
}

/** Roles that have credentials, for the auth setup. @returns {string[]} */
export const roles = () =>
  (process.env.E2E_ROLES ?? 'applicant')
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean)
