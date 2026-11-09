import { BasePage } from './base.page.js'
import { homeContent } from '../content/site.js'

/** ProficiencyTestingExternalWeb home page and header. */
export class ExternalHomePage extends BasePage {
  get sectionHeadings() { // source: docs/discovery/crawl.json /Home.aspx headings
    return this.page.getByRole('heading', { level: 2 }) // source: docs/discovery/crawl.json /Home.aspx headings
  }

  get cardHeadings() { // source: docs/discovery/crawl.json /Home.aspx headings
    return this.page.getByRole('heading', { level: 3 }) // source: docs/discovery/crawl.json /Home.aspx headings
  }

  get loggedInLabel() { // source: app/ProficiencyTestingExternalWeb/NavigationBar.ascx
    return this.page.getByText(homeContent.loggedInLabel) // source: app/ProficiencyTestingExternalWeb/NavigationBar.ascx
  }

  get userName() { // source: app/ProficiencyTestingExternalWeb/Utilities/UserPermissions.vb:41
    return this.page.getByText(homeContent.userName, { exact: true }) // source: app/ProficiencyTestingExternalWeb/Utilities/UserPermissions.vb:41
  }

  /** @param {string} name */
  link(name) {
    return this.page.getByRole('link', { name, exact: true }) // source: docs/discovery/crawl.json /Home.aspx
  }

  get logOut() { // source: docs/discovery/crawl.json /Home.aspx
    return this.page.getByRole('button', { name: homeContent.logOut, exact: true }) // source: docs/discovery/crawl.json /Home.aspx
  }
}
