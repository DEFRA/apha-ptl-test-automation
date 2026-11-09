import { Given, When, Then, test } from '../../support/fixtures.js'
import { holdLock } from '../../support/lock.js'
import { openFirstScheme, selectTab, saveTab, applyTab, cancelTab, addTabulation, renameTabulation, removeTabulation, chooseOtherConsultant, setConsultant, moveFirstMethodItemDownAndBack, testCount, itemCount, addTestOfLastType, removeLastTest, addItemToFirstTest, removeLastItemOfFirstTest } from '../../flows/scheme-tabs.flow.js'
import { expectTabulation, expectConsultant, expectTestCount, expectItemCount } from '../../assertions/scheme-tabs.assertions.js'

export { test }

const state = new WeakMap()
const mine = (page) => { if (!state.has(page)) state.set(page, {}); return state.get(page) }
const named = (name, runId) => `${name} ${runId}`.slice(0, 40)

Given('an admin has opened the first scheme', async ({ page, cleanup }) => {
  test.setTimeout(900000)
  await holdLock(page, 'admin-full', cleanup)
  await openFirstScheme(page)
})

When('they add the tabulation {string} to the scheme', async ({ page, runId, cleanup }, name) => {
  await selectTab(page, 'Results Tabulations')
  const unique = named(name, runId)
  mine(page).tabulation = unique
  cleanup(async () => {
    await openFirstScheme(page)
    await selectTab(page, 'Results Tabulations')
    await removeTabulation(page, unique)
    await removeTabulation(page, `${unique} renamed`.slice(0, 50))
  })
  await addTabulation(page, unique)
})

When('they rename that tabulation to {string}', async ({ page }, suffix) => {
  await selectTab(page, 'Results Tabulations')
  await renameTabulation(page, mine(page).tabulation, `${mine(page).tabulation} ${suffix}`.slice(0, 50))
  mine(page).renamed = `${mine(page).tabulation} ${suffix}`.slice(0, 50)
})

When('they remove that tabulation', async ({ page }) => {
  await selectTab(page, 'Results Tabulations')
  await removeTabulation(page, mine(page).renamed ?? mine(page).tabulation)
})

Then('the tabulation is {string} after reloading the scheme', async ({ page }, outcome) => {
  await openFirstScheme(page)
  await selectTab(page, 'Results Tabulations')
  await expectTabulation(page, mine(page).renamed ?? mine(page).tabulation, outcome === 'listed')
})

When('they choose another test consultant in slot {int} and save', async ({ page, cleanup }, slot) => {
  await selectTab(page, 'Test consultants')
  const { original, other } = await chooseOtherConsultant(page, slot - 1)
  mine(page).consultant = { slot: slot - 1, original, other }
  cleanup(async () => {
    await openFirstScheme(page)
    await selectTab(page, 'Test consultants')
    await setConsultant(page, slot - 1, original)
    await saveTab(page, 'Test consultants')
  })
  await saveTab(page, 'Test consultants')
})

Then('the test consultant slot shows the new choice after reloading the scheme', async ({ page }) => {
  await openFirstScheme(page)
  await selectTab(page, 'Test consultants')
  await expectConsultant(page, mine(page).consultant.slot, mine(page).consultant.other)
})

When('they press {string} on the scheme tab {string}', async ({ page }, action, tab) => {
  await selectTab(page, tab)
  if (action === 'Apply') await applyTab(page, tab)
  else if (action === 'Save') await saveTab(page, tab)
  else await cancelTab(page, tab)
})

When('they move the first method item down and back up', async ({ page }) => {
  await selectTab(page, 'Tests')
  await moveFirstMethodItemDownAndBack(page)
})


When('they add a test of the last type to the scheme', async ({ page, cleanup }) => {
  await selectTab(page, 'Tests')
  const before = await testCount(page)
  mine(page).tests = before
  cleanup(async () => {
    await openFirstScheme(page)
    await selectTab(page, 'Tests')
    while ((await testCount(page)) > before) await removeLastTest(page)
  })
  await addTestOfLastType(page)
})

Then('the scheme shows one more test', async ({ page }) => {
  await expectTestCount(page, mine(page).tests + 1)
})

When('they remove the last test of the scheme', async ({ page }) => {
  await removeLastTest(page)
})

Then('the scheme shows its original number of tests', async ({ page }) => {
  await expectTestCount(page, mine(page).tests)
})

When('they add a {string} item to the first test', async ({ page, cleanup }, kind) => {
  await selectTab(page, 'Tests')
  const before = await itemCount(page, kind)
  mine(page).items = before
  cleanup(async () => {
    await openFirstScheme(page)
    await selectTab(page, 'Tests')
    while ((await itemCount(page, kind)) > before) await removeLastItemOfFirstTest(page, kind)
  })
  await addItemToFirstTest(page, kind)
})

Then('the first test shows one more {string} item', async ({ page }, kind) => {
  await expectItemCount(page, kind, mine(page).items + 1)
})

When('they remove the last {string} item of the first test', async ({ page }, kind) => {
  await removeLastItemOfFirstTest(page, kind)
})

Then('the first test shows its original number of {string} items', async ({ page }, kind) => {
  await expectItemCount(page, kind, mine(page).items)
})
