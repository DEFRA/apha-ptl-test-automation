import { Given, Then, test } from '../support/fixtures.js'
import { expectSoapResultFor, expectSoapEnvelope } from '../assertions/soap-args.assertions.js'
import { webServicesUrl } from '../support/env.js'

export { test }

const replies = new WeakMap()

Given('the SOAP operation {string} of service {string} is called with {string}', async ({ request }, operation, service, args) => {
  const base = `${webServicesUrl()}/${service}` // source: app/ProficiencyTestingWebServices/*.asmx
  const wsdl = await (await request.get(`${base}?WSDL`)).text()
  const ns = /targetNamespace="([^"]+)"/.exec(wsdl)[1]
  const body = args.split(';').map((pair) => pair.split('=')).map(([name, value]) => `<${name}>${value}</${name}>`).join('')
  const envelope = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><${operation} xmlns="${ns}">${body}</${operation}></soap:Body></soap:Envelope>`
  const response = await request.post(base, { headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: `"${ns.replace(/\/$/, '')}/${operation}"` }, data: envelope })
  replies.set(request, { status: response.status(), body: await response.text() })
})

Then('the SOAP reply is a result for {string}', async ({ request }, operation) => {
  expectSoapResultFor(replies.get(request), operation)
})

Then('the SOAP reply is an envelope and not an error page', async ({ request }) => {
  expectSoapEnvelope(replies.get(request))
})
