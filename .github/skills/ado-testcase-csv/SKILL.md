---
name: ado-testcase-csv
description: Writes detailed manual test cases for Azure DevOps Test Plans as JSON and converts them to the ADO import CSV with a bundled script, with a local TC reference per case for automation traceability. Use when generating test cases from requirements, user stories or acceptance criteria, producing the ADO CSV, or checking that every test case has an automated scenario.
metadata:
  version: "1.0"
compatibility: Requires Python 3 and Node.js 20 or later
---

# ADO test cases (CSV)

The canonical rules are in `references/ado_testcase_agent_prompt.md` (process, step rules, constraints, checklist). Read it once per session before writing. If it differs from this file, it wins, except for the differences listed below.

## Essentials

- Trace every test case to at least one acceptance criterion. Never invent rules.
- Step 1 is login, navigation or precondition setup. One action per step. At least 5 steps.
- Give every step a concrete Expected Result. Avoid "appropriate", "correct", "properly", "as expected".
- Make titles unique, 120 characters or fewer, starting with the behaviour under test.
- Put unknown values in angle brackets (`<valid application number>`) and list them in `assumptions`.

## Differences from the reference prompt

- Write JSON to `test/journey/docs/test-cases/<feature>.json`. Never paste JSON or CSV in chat.
- Add per test case: `ref` (`TC-001`, unique across the project), `layer` (`ui`, `api` or `hybrid`) and `acs` (list). The converter ignores these extra keys.
- Expand every scenario in `docs/scenarios.json` and the plan, all features, in one pass. There is no approval step; put anything genuinely undecidable under `open_questions` and keep writing.
- When no user story or acceptance criteria exist, derive them from the code and the crawl and cite the evidence (`DERIVED: <behaviour> - <file:line>`), then write the cases.

## Convert and validate

```
python .github/skills/ado-testcase-csv/scripts/json_to_ado_csv.py docs/test-cases/<f>.json docs/test-cases/<f>.csv
```

Use `python3` or `py` if `python` is not available. Fix every `WARNING`. The script writes UTF-8 with BOM and CRLF in the layout of `references/sample_ado_test_cases.csv`. Leave the ID column blank so ADO creates new work items.

✅ Run the script and read its 3-line summary
❌ Write CSV rows by hand

## Adopting existing cases

A repository may already have CSV cases and no worklog. Merge, never regenerate:

- Read the existing `<feature>.json`, `<feature>.csv` and any ADO export. Treat their `ref` values as taken: keep every one and continue numbering after the highest `TC-nnn`.
- Add only catalogue rows with no matching case, matching on title plus criteria. Report `adopted / added / skipped` counts rather than prose.
- Keep a legacy case whose evidence is missing and tag it `unverified` in `assumptions`. Do not delete it and do not renumber it.
- Re-run the converter over the merged JSON so the CSV stays fresh; `trace-check` then reports the real gaps.
- Log the set as `adopted` in `docs/worklog.md` with its path and mtime, so a later run skips it.

## Traceability to automation

- Write one Scenario per test case with the same title, tagged `@TC-001`.
- Check with `node scripts/trace-check.js`. It lists test cases with no scenario, scenarios with no test case, and duplicate refs. Use `--allow-missing` while a build is in progress.
- ADO assigns its own IDs on import. Keep `ref` as the stable key.
