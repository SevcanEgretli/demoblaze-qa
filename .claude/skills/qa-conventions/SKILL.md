---
name: qa-conventions
description: Points to this repo's Cypress/TypeScript test-automation conventions (Page Object Model, selector strategy, custom commands, no fixed waits, architecture boundaries). Use whenever adding or editing a spec file, page object, component, custom command, fixture, or selector in cypress/.
---

# QA conventions — demoblaze-qa

This repo's testing conventions are defined **once**, in `docs/CONTRIBUTING.md`. Read that
file before writing or editing anything under `cypress/` and follow it — Page Object Model
boundaries, duplication rules, when a flow becomes a custom command, selector priority,
no-fixed-waits, secrets handling, and the one-way architecture boundaries between
`tests/`, `pages/`, `components/`, `factories/`, `utils/`, and `support/commands.ts`.

Don't restate its rules here. If you're tempted to, that's a sign `docs/CONTRIBUTING.md`
itself needs a clearer rule instead — fix it there so there is exactly one place these
rules can drift out of sync.

## Before finishing

Run `npm run lint`, `npm run typecheck`, and the relevant spec(s) against the live site before
calling the change done — this repo has no mocked backend, so a green run is the only real
signal.
