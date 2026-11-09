import js from '@eslint/js'
import playwright from 'eslint-plugin-playwright'
import globals from 'globals'

/**
 * Three of the pack's rules are enforced here rather than hoped for:
 * no fixed sleeps, no `.only`, no `.skip`. Keep this file in step with
 * instructions/journey-tests.instructions.md.
 */
export default [
  {
    ignores: ['.features-gen/**', 'reports/**', 'test-results/**', 'playwright-report/**', '.auth/**', 'node_modules/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      // `page.evaluate` callbacks run in the browser, so both global sets are legitimate here.
      globals: { ...globals.node, ...globals.browser }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Playwright fixtures destructure an empty object: async ({}, use) => {}
      'no-empty-pattern': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='waitForTimeout']",
          message: 'No fixed sleeps. Wait on a condition the user can see (web-first assertion or a response).'
        },
        {
          selector: "CallExpression[callee.property.name='pause']",
          message: 'page.pause() must not be committed.'
        }
      ]
    }
  },
  {
    files: ['steps/**/*.js'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...(playwright.configs['flat/recommended'].rules ?? {}),
      'playwright/no-skipped-test': 'error',
      'playwright/no-focused-test': 'error'
    }
  }
]
