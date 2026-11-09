import { faker } from '@faker-js/faker'

/**
 * Seeded builders for synthetic data. A seed makes a failure reproducible: the same seed
 * produces the same values, and the seed is logged when a test fails.
 *
 * Rules (instructions/journey-tests.instructions.md): synthetic only, unique per run, never
 * copied from a real record.
 */

/** Stable 32-bit hash so a string seed is reproducible across runs. */
const seedOf = (value) => {
  let hash = 2166136261
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/**
 * @param {{ seed?: string }} [options]
 * @returns {{ firstName: string, lastName: string, email: string, dateOfBirth: { day: string, month: string, year: string, iso: string } }}
 */
export function buildApplicant({ seed = 'applicant' } = {}) {
  faker.seed(seedOf(seed))
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const birth = faker.date.birthdate({ min: 18, max: 90, mode: 'age' })
  return {
    firstName,
    lastName,
    email: `test+${seed}@example.com`,
    dateOfBirth: {
      day: String(birth.getUTCDate()).padStart(2, '0'),
      month: String(birth.getUTCMonth() + 1).padStart(2, '0'),
      year: String(birth.getUTCFullYear()),
      iso: birth.toISOString().slice(0, 10)
    }
  }
}

/** Boundary variants for validation tests. @param {'empty'|'too-long'|'invalid-format'} kind */
export function boundaryEmail(kind) {
  switch (kind) {
    case 'empty':
      return ''
    case 'too-long':
      return `${'a'.repeat(250)}@example.com`
    case 'invalid-format':
      return 'not-an-email'
    default:
      throw new Error(`Unknown boundary kind: ${kind}`)
  }
}
