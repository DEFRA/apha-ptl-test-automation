import { byProfile } from '../support/profiles.js'

export const navigationRoutes = {
  help: byProfile({ legacy: '/Help.aspx', gds: '/Help.aspx' }), // source: app/ProficiencyTestingExternalWeb/Footer.ascx:12
  home: byProfile({ legacy: '/Home.aspx', gds: '/Home.aspx' }) // source: app/ProficiencyTestingExternalWeb/NavigationBar.ascx:43
}

export const navigationHeadings = {
  home: byProfile({ legacy: 'VETQAS Proficiency Testing', gds: 'VETQAS Proficiency Testing' }), // source: crawl http://localhost:1688/Home.aspx
  help: byProfile({ legacy: 'Help', gds: 'Help' }), // source: crawl http://localhost:1688/Help.aspx
  accessibility: byProfile({ legacy: 'Accessibility statement for the PT\u2011LIMS website', gds: 'Accessibility statement for the PT\u2011LIMS website' }), // source: crawl http://localhost:1688/AccessibilityStatement.aspx (non-breaking hyphen)
  systemInformation: byProfile({ legacy: 'About', gds: 'About' }), // source: crawl http://localhost:1688/About.aspx
  privacy: byProfile({ legacy: 'VETQAS Privacy Notice', gds: 'VETQAS Privacy Notice' }) // source: crawl http://localhost:1688/PrivacyPolicy.aspx
}

/** Logo link name is the image alt text. */
export const logoLabel = byProfile({ legacy: 'Proficiency Testing homepage', gds: 'Proficiency Testing homepage' }) // source: app/ProficiencyTestingExternalWeb/NavigationBar.ascx:43

/** Footer links keyed by meaning; `name` is the accessible name (the aria-label). */
export const footerLinks = {
  help: { name: byProfile({ legacy: 'View our help documentation', gds: 'View our help documentation' }), heading: navigationHeadings.help }, // source: app/ProficiencyTestingExternalWeb/Footer.ascx:12
  accessibility: { name: byProfile({ legacy: 'View our accessibility statement', gds: 'View our accessibility statement' }), heading: navigationHeadings.accessibility }, // source: app/ProficiencyTestingExternalWeb/Footer.ascx:13
  systemInformation: { name: byProfile({ legacy: 'View the system information', gds: 'View the system information' }), heading: navigationHeadings.systemInformation }, // source: app/ProficiencyTestingExternalWeb/Footer.ascx:14
  privacy: { name: byProfile({ legacy: 'View our privacy policy', gds: 'View our privacy policy' }), heading: navigationHeadings.privacy } // source: app/ProficiencyTestingExternalWeb/Footer.ascx:15
}
