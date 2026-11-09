import { expect } from '@playwright/test'

export function expectSoapResultFor(reply, operation) {
  expect(reply.status, reply.body.slice(0, 200)).toBe(200) // source: app/ProficiencyTestingWebServices/*.asmx WebMethod
  expect(reply.body).toContain(`<${operation}Response`) // source: app/ProficiencyTestingWebServices/*.asmx WebMethod
  expect(reply.body).not.toContain('<soap:Fault') // source: app/ProficiencyTestingWebServices/*.asmx WebMethod
}

export function expectSoapEnvelope(reply) {
  expect(reply.body, `status ${reply.status}`).toContain('Envelope') // source: app/ProficiencyTestingWebServices/*.asmx WebMethod
  expect(reply.body.trimStart().toLowerCase().startsWith('<!doctype html')).toBe(false) // source: app/ProficiencyTestingWebServices/*.asmx WebMethod
}
