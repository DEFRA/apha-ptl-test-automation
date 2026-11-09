# Flows

A flow is one business task, expressed without naming screens:

```javascript
export class ApplicantFlow {
  constructor(page) {
    this.details = new ApplicantDetailsPage(page)
    this.check = new CheckAnswersPage(page)
  }

  /** @param {ReturnType<typeof buildApplicant>} applicant */
  async complete(applicant) {
    await this.details.open()
    await this.details.enter(applicant)
    await this.details.continue()
  }
}
```

Why a flow and not a step that clicks through pages: the GDS migration changes how many pages a
task takes (one question per page). A flow owns that count, so the step — and therefore the
feature file and the approved test case — does not change.

Steps call flows. Flows call pages and components. Pages never call flows.
