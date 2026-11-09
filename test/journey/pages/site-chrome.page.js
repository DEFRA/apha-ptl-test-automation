import { BasePage } from './base.page.js'
import { logoLabel, footerLinks } from '../content/navigation.js'

/** Header logo and footer links shared by every page. */
export class SiteChromePage extends BasePage {
  get logo() { // source: app/ProficiencyTestingExternalWeb/NavigationBar.ascx:43
    return this.page.getByRole('link', { name: logoLabel }) // source: app/ProficiencyTestingExternalWeb/NavigationBar.ascx:43
  }

  /** @param {keyof typeof footerLinks} key */
  footerLink(key) {
    return this.footer.getByRole('link', { name: footerLinks[key].name, exact: true }) // source: app/ProficiencyTestingExternalWeb/Footer.ascx:12-15
  }
}
