# Potential defects


## PD-001 Export Contracts and Export Job Sheets do not respond
- Severity / Priority: Medium / Medium
- Feature / URL: Contracts Admin > Exports, `/Contract/ExportContracts` and `/Contract/ExportJobSheets`
- Steps: sign in with Contracts Admin, open the page (a template is selected), press Export.
- Expected: a Word file downloads.
- Actual: the request is still pending after 30 s and 60 s; no file arrived. Export Renewal Letters and Export Address Confirmation Letters download normally.
- Evidence: Playwright run 2026-11-12, scenario TC-INT-141 examples 1 and 2 (now `@wip`).
- Potential root cause: the mail merge covers the whole data set (about 1,100 customers in this environment) and runs in-process (`TemplateMergeService`).
- Recommendation: confirm with the team whether a long run is expected; if so add progress feedback and a longer wait, otherwise investigate the merge.

## PD-002 Upload without a file shows "File not found" as plain text
- Severity / Priority: Low / Low
- URL: `/Contract/Export*` pages; pressing Upload with no file chosen.
- Expected: GOV.UK error summary and inline error message.
- Actual: the text "File not found" appears without an error summary or inline error component.
- Recommendation: use the standard error summary so screen readers announce it.

## PD-003 Pending customer update declined by an exploratory probe
- Not an application defect. A probe click on Decline took effect immediately with no confirmation step (observation: Approve and Decline act on a single click). Consider a confirmation step.

## PD-001 update (2026-11-12)
Export Contracts takes about 30 s with a 1 KB template (QATContractTemplate.docx, built by scripts/make-template.ps1) and longer than 80 s with the shipped Contract.docx. The delay therefore scales with the data or template, not with a hang. Scenario TC-INT-144 exports with the synthetic template and waits up to 120 s; the shipped-template rows stay `@wip`.

## PD-004 Template upload rejects hyphens with a misleading message
- Severity / Priority: Low / Low
- URL: `/Contract/Export*` upload.
- Steps: upload a .docx named `QAT-Hyphen-Name.docx`.
- Expected: a message about the file name characters.
- Actual: "The file does not have a .Docx extension". The rule (`^\w[\w\s]*\.docx$`, ExportTemplateService.cs) only allows letters, digits, underscores and spaces in the name.
- Recommendation: say which characters are allowed.

## Observation: deleting a template needs a confirmation step
Delete posts to `/Contract/DeleteExportTemplate` and shows "Are you sure that you want to delete this template?" with Delete and Cancel. The earlier probe cleanup skipped that step, so a test template stayed behind until removed manually via the app.
