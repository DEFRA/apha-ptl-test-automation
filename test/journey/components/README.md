# Components

Widgets go here. The ready-made GOV.UK wrappers ship with skill `gds-migration-resilience`:

```
cp .github/skills/gds-migration-resilience/templates/components/*.js test/journey/components/
```

That gives you: `text-input`, `date-input`, `radios`, `checkboxes`, `character-count`,
`summary-list`, `file-upload`, `task-list`, `error-summary`, `cookie-banner`, `skip-link`,
and the `Component` base class.

Rules:

- A component owns locators and actions. No assertions, no visible text of its own: callers pass
  labels from `content/`.
- Where the DOM differs between profiles, branch inside the component with `byProfile`, and mark
  the legacy branch `// legacy-only:`.
- Components are generic, so they are outside the `// source:` grounding check. Pages are not.
