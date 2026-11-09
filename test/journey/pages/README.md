# Page objects

No example page ships with the scaffold on purpose: a page object that cites a fabricated
`// source:` line would pass the grounding check while being ungrounded.

Write one page object per screen, extending `BasePage`:

```javascript
import { BasePage } from './base.page.js'
import { TextInput } from '../components/text-input.js'
import { labels } from '../content/labels.js'
import { routes } from '../content/routes.js'

export class ApplicantDetailsPage extends BasePage {
  constructor(page) {
    // Add the route to content/routes.js first; this file only uses routes.start.
    super(page, routes.applicantDetails)
    this.email = new TextInput(page, { id: 'email', label: labels.email }) // source: src/views/applicant-details.njk:14
  }

  async enterEmail(value) {
    await this.email.enter(value)
  }

  async continue() {
    await this.clickButton(labels.continue)
  }
}
```

Rules:

- Locators and actions only. Assertions live in steps or `*.assertions.js`.
- Locate by role, label or heading. Never by id, index or CSS except inside `byProfile`.
- Every locator carries a `// source:` comment: `node scripts/check-grounding.js` fails without it.
- One page object per screen, named after the file the discovery notes cite.
