# Internal app investigation worklog

Source: `C:\Dev\apha-ptl-apps-main\src\PTL.InternalWeb` (ASP.NET Core MVC, Entra ID sign-in, roles from the PTL database). Live: `PROFICIENCY_TESTING_WEB_URL` (`.env`). Credentials: `INTERNAL_WEB_APPLICANT_USER` / `INTERNAL_WEB_APPLICANT_PASSWORD`.

| When | Phase | Unit | Result | Evidence |
|---|---|---|---|---|
| 2026-11-12 | discover | source routes | done: 16 controllers, 214 actions | `docs/internal/route-inventory.json` (`scripts/extract-internal-routes.js`) |
| 2026-11-12 | discover | live probe | done: root answers 302 to Entra ID; `/Test Consultant`, `/Assessor`, `/Results Sign-off` are attribute-routed | probe output |
| 2026-11-12 | amend | auth, config, env | done | `support/internal-auth.setup.js`, `playwright.config.js`, `.env.example` |
| 2026-11-12 | build | features/internal (access, navigation, customers, search) | done: 79 scenarios | `features/internal/*.feature` |
| 2026-11-12 | execute | internal-setup + internal + internal-anonymous | done: 79 passed | `reports/playwright/results.json` |
| 2026-11-12 | config | `UI_PROFILE=gds` in `.env` and `.env.example` | done | `.env.example` |
| 2026-11-12 | build | `features/internal/internal-details.feature`: customer drill-down, edit validation, paging tolerance, create-form validation (group address, scheme, participant) | done: 27 scenarios | `steps/internal/detail.steps.js` |
| 2026-11-12 | execute | full internal run | done: 106 passed, lint clean | `reports/playwright/results.json` |

Observed while building: Create Participant does not report an empty Lab Code (the field is not flagged), and its messages say "Enter address line 1/2" (not "Enter address 1/2", which only the pending-update form uses).

## Amendments to existing assets
- Playwright projects `setup`, `journey`, `admin`, `admin-crud`, `admin-roles`, `anonymous` removed. They targeted legacy WebForms (Windows auth) and the external site. Replaced by `internal-setup`, `internal`, `internal-anonymous`. Reason: UI update. Impact: `features/admin` and `features/external` are no longer run by any project (parked, not deleted; external parked as requested).
- `.env.example` held a real-looking account name and password. Both removed; rotate that password if it was ever committed or shared.
- `PROFICIENCY_TESTING_WEB_URL` in `.env` now points at the new internal URL.

## Findings
- Default route is `Account/Login`, so `/` always redirects to Entra ID. Home is `/Home/Index`.
- Customer list filters by status only; name search lives on `/Search/Index` (customers and participants tabs, all criteria optional, max lengths enforced by `maxlength` and by the server for direct links).
- `maxlength` on form inputs means over-length server messages are only reachable through direct links (covered for search).
- Test account lacks the Generate Invoices role: `/Invoice/Index` is refused with Access Denied (recorded as a `role-gap` annotation).

## Coverage gaps (not automated)
- Create/update/delete success paths for Customer, Participant, Contract, Group Address, Scheme, Scheme Admin item lists, Country, Viewers, pricing plans: need seed-and-cleanup through PTL.Api or a disposable environment.
- Pending-update review (approve/decline), Exports and mail merge, Import permits, Renew contracts, Invoice generation.
- Distribution monthly workflow (schedule, preparation, packaging, sample numbers, receipts, tabulation, issue), Assessor, Test Consultant, Results Sign-off workflows (pages open; actions untested).
- Role matrix: only one account. Every policy-refusal scenario needs a low-privilege account.
- Parameterised pages (`/Customer/Details/{id}`, `/Contract/...`) reached only through the navigation crawl.
- Not done: ADO test-case JSON/CSV for `@TC-INT-*`, so `scripts/trace-check.js` will not match them; sorting/pagination checks; file upload and download features.

## Risks
- Entra sign-in relies on an account without MFA; an MFA prompt fails `internal-setup`.
- Shared test environment: write scenarios need unique data and teardown before they are added.
- `steps/internal/*.steps.js` disable `playwright/no-standalone-expect`; move assertions into `*.assertions.js`.

