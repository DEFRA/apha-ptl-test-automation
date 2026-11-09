#!/usr/bin/env python3
"""Convert the agent's JSON output into an Azure DevOps test-case import CSV.

Usage:  python json_to_ado_csv.py agent_output.json [output.csv]

Layout (matches Book1.csv): columns
ID, Work Item Type, Title, Test Step, Step Action, Step Expected,
Area Path, Assigned To, State
- First row of each test case carries Work Item Type, Title, Area Path,
  Assigned To, State and Step 1. Following rows carry only the step columns.
- ID left blank so ADO creates new work items.
- UTF-8 with BOM + CRLF line endings, as in the template.
"""
import csv
import json
import re
import sys

HEADER = ["ID", "Work Item Type", "Title", "Test Step", "Step Action",
          "Step Expected", "Area Path", "Assigned To", "State"]


def load(path):
    text = open(path, encoding="utf-8-sig").read().strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)  # tolerate code fences
    data = json.loads(text)
    if "clarification_needed" in data:
        sys.exit("Agent needs clarification: " + data["clarification_needed"])
    return data


def validate(tcs):
    seen, problems = set(), []
    for i, tc in enumerate(tcs, 1):
        t = tc.get("title", "").strip()
        if not t:
            problems.append(f"Test case {i}: missing title")
        if t.lower() in seen:
            problems.append(f"Test case {i}: duplicate title '{t}'")
        seen.add(t.lower())
        steps = tc.get("steps", [])
        if len(steps) < 5:
            problems.append(f"'{t}': only {len(steps)} steps (min 5)")
        for n, s in enumerate(steps, 1):
            if not s.get("action", "").strip() or not s.get("expected", "").strip():
                problems.append(f"'{t}' step {n}: blank action/expected")
    return problems


def write(data, out):
    tcs = data["test_cases"]
    with open(out, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f, lineterminator="\r\n", quoting=csv.QUOTE_MINIMAL)
        w.writerow(HEADER)
        for tc in tcs:
            for n, step in enumerate(tc["steps"], 1):
                first = n == 1
                w.writerow([
                    "",
                    "Test Case" if first else "",
                    tc["title"] if first else "",
                    f"Step {n}",
                    step["action"],
                    step["expected"],
                    tc.get("area_path", "Path x") if first else "",
                    tc.get("assigned_to", "") if first else "",
                    tc.get("state", "Design") if first else "",
                ])
    return len(tcs), sum(len(t["steps"]) for t in tcs)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = sys.argv[1]
    dst = sys.argv[2] if len(sys.argv) > 2 else "ado_test_cases.csv"
    d = load(src)
    for p in validate(d["test_cases"]):
        print("WARNING:", p)
    n_tc, n_steps = write(d, dst)
    print(f"Wrote {n_tc} test cases / {n_steps} step rows to {dst}")
    for q in d.get("open_questions", []):
        print("OPEN QUESTION:", q)
