import { expect } from '@playwright/test'

/**
 * Thin REST client over Playwright's APIRequestContext: base URL from env, JSON by default,
 * and one place where a non-2xx response becomes a useful failure instead of a silent body.
 *
 * Add one module per resource (`api/applicant.api.js`) that composes this client, and cite
 * the server route in a `// source:` comment above each endpoint.
 */
export class ApiClient {
  /** @param {import('@playwright/test').APIRequestContext} request */
  constructor(request) {
    this.request = request
  }

  /**
   * @param {string} path
   * @param {{ method?: 'get'|'post'|'put'|'patch'|'delete', data?: unknown, headers?: Record<string,string> }} [options]
   */
  async call(path, { method = 'get', data, headers } = {}) {
    const response = await this.request[method](path, {
      data,
      headers: { 'Content-Type': 'application/json', ...headers }
    })
    return response
  }

  /**
   * Call and require a status, with the response body in the failure message.
   * @param {string} path
   * @param {{ method?: 'get'|'post'|'put'|'patch'|'delete', data?: unknown, status?: number, headers?: Record<string,string> }} [options]
   */
  async expectStatus(path, { status = 200, ...options } = {}) {
    const response = await this.call(path, options)
    const body = await response.text()
    expect(response.status(), `${options.method ?? 'get'} ${path} -> ${response.status()} ${body.slice(0, 400)}`).toBe(status)
    return response
  }

  /**
   * Read JSON and assert the response shape with a schema validator supplied by the caller
   * (zod is in devDependencies). Keeping the schema in the resource module keeps this generic.
   * @template T
   * @param {string} path
   * @param {(value: unknown) => T} parse
   * @param {{ method?: 'get'|'post'|'put'|'patch'|'delete', status?: number }} [options]
   * @returns {Promise<T>}
   */
  async json(path, parse, options) {
    const response = await this.expectStatus(path, options)
    return parse(await response.json())
  }
}
