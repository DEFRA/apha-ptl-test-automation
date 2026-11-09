import { participantCreate, contractCreate } from '../content/participant-contract.js'

const field = (page, id) => page.locator(`[id$=${id}]`).first() // source: ASP.NET control ids on Participant.aspx and Contract.aspx

async function fillForm(page, config, name, runId) {
  for (const [id, value] of Object.entries(config.textFields)) await field(page, id).fill(value.replace('NAME', name).replace('LAB', `E2E${runId}`.slice(0, 8)).replace('RUN', runId.replace(/\W/g, '').slice(0, 8)))
  for (const id of config.dropdowns) await field(page, id).selectOption({ index: 1 }) // first real option after "- Please Select -"
}

export const fillParticipant = (page, name, runId) => fillForm(page, participantCreate, name, runId)
export const fillContract = (page, runId) => fillForm(page, contractCreate, '', runId)

export async function openCreateForm(page, config) {
  await page.goto(config.route) // the customer is taken from the session set by the Participants or Contracts list
}

export async function saveForm(page, config) {
  await field(page, config.save).click()
  await page.waitForLoadState('load')
}

/** Neither can be deleted, so the test leaves them inactive. */
export async function makeInactive(page, config) {
  const active = field(page, config.activeBox)
  if ((await active.count()) === 0 || !(await active.isChecked())) return
  await active.uncheck()
  await page.waitForLoadState('load')
  await saveForm(page, config)
}
