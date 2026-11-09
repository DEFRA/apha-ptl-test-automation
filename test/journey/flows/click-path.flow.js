import { SurveyPage } from '../pages/survey.page.js'

/** Click from Home through each link of the path, like a user following the menus and lists. */
export async function followClickPath(page, path) {
  const survey = new SurveyPage(page)
  await page.goto('/home.aspx') // source: docs/discovery/crawl-admin.json /home.aspx
  for (const name of path.split(' > ')) {
    await survey.link(name).click()
    await page.waitForLoadState('load')
  }
}
