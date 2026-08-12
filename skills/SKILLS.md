# SKILLS.md — Test Automation Best Practices

Rules for keeping this suite **extendable and maintainable**. Every contribution
(human or AI-assisted) must follow them. When reviewing a PR, check against this list.

---

## 1. Use the Page Object Model

- **Specs never contain selectors.** All locators live in `cypress/pages/` (page objects)
  or `cypress/components/` (shared UI). If you type `cy.get('#...')` inside a spec, stop
  and move it to a page object.
- Locators are `private` getters; specs interact only through **public action methods**
  (`logIn()`, `addToCart()`) and **public state readers** (`getTotalPrice()`).
- **Page objects contain no assertions.** Assertions belong in specs, so a locator change
  never hides a behavioral expectation. Page objects *may* use `.should('be.visible')`
  purely as a wait before interacting (see rule 4).
- One file per page/component, exported as a singleton, re-exported from the barrel
  (`cypress/pages/index.ts`) so specs import from one place.

## 2. Don't duplicate anything

- **Locators**: each element is defined in exactly one place. UI that appears on multiple
  pages (navbar, modals) lives in `cypress/components/` and is composed into pages —
  never re-declared per page (`BasePage` exposes `navBar`; modals extend `BaseModal`).
- **Flows**: a multi-step flow needed by more than one spec becomes a custom command
  (rule 3) or a page-object method — never copy-pasted between specs.
- **Data**: static datasets live once in `cypress/fixtures/`; generated data comes from
  one factory in `cypress/factories/`. No inline magic strings repeated across specs.
- **Config**: timeouts, baseUrl, viewport are set once in `cypress.config.ts` — specs
  never override them ad hoc.

## 3. Promote shared functions to custom commands

- If a function/flow is useful across **different pages or specs** (login, sign-up,
  seeding a cart), register it as a custom command in `cypress/support/commands.ts`
  and declare its type in `cypress/types/index.d.ts`.
- Custom commands are for **cross-cutting flows**; behavior specific to a single page
  stays a page-object method. Don't wrap every one-liner in a command.
- Commands should be built **on top of page objects**, not on raw selectors.

## 4. No fixed waits — wait on signals

- **`cy.wait(3000)` is banned** (ESLint enforces `cypress/no-unnecessary-waiting`).
- Wait for something observable instead:
  - **API calls**: `cy.intercept()` the request, act, then `cy.wait('@alias')`.
  - **Elements**: `cy.get(...).should('be.visible')` / `.should('exist')` — Cypress
    retries automatically until timeout.
  - **Text/state**: `cy.contains(...)`, `.should('contain.text', ...)`,
    `.should('not.exist')` for spinners/overlays.
- If a test is flaky, find the missing signal — never "fix" it by sleeping longer.

## 5. Keep the code organized with ESLint + Prettier

- Run `npm run lint` before pushing; CI should fail on lint errors. `npm run format`
  keeps style consistent so diffs stay small.
- Don't disable rules inline (`eslint-disable`) without a comment explaining why.
- TypeScript `strict` mode stays on. No `any` unless there is genuinely no type —
  prefer declaring models in `cypress/types/models.ts`.

## 6. Selector strategy — no XPath

- **XPath is banned.** Priority order for selectors:
  1. **`id`** — `cy.get('#login2')` (demoblaze has ids on most interactive elements).
  2. **Dedicated test attribute** if the team can add one: `[data-cy="submit"]`.
  3. **Class or role** — `cy.get('.card-title')`, `cy.contains('button', 'Log in')` —
     but you **must verify the element resolves uniquely and correctly** (run it in the
     Cypress runner and confirm it matches exactly the intended element).
- Never select by layout position (`.eq(3)`, `nth-child`) or by brittle chained CSS
  (`div > div > span`) — these break on any DOM reshuffle.
- Prefer selecting by **stable semantics** (what the element *is*), not appearance
  (styling classes like `.btn-primary` that designers may change).

---

## Additional rules for extendability & maintainability

## 7. Tests are independent and repeatable

- Every spec must pass **alone** (`--spec` on one file) and in **any order**. Never rely
  on state left behind by a previous test.
- Set up preconditions in `beforeEach` (via custom commands), not in a prior `it()`.
- Data that must be unique per run (demoblaze usernames) comes from factories —
  a re-run must never fail because "user already exists".

## 8. Small, focused, well-named tests

- One `it()` verifies **one behavior**; its name states the expected outcome:
  `it('shows an error when the password is wrong')`, not `it('test login 2')`.
- Group by feature with `describe()`. Spec files use the `.spec.ts` suffix and live under
  `cypress/tests/{e2e,integration,api}/<feature>/`.
- Keep specs readable as scenarios: *arrange* (data/preconditions) → *act* (page-object
  calls) → *assert* (expectations). A reader should understand the business flow without
  opening the page objects.

## 9. Manage secrets and environments safely

- **Never commit credentials.** Real values go in `cypress.env.json` (git-ignored);
  the repo carries only `cypress.env.example.json` as a template.
- Environment-specific values (URLs, users) come from `Cypress.env()` / config — never
  hard-coded in specs, so the same suite runs against any environment.

## 10. Handle test data deliberately

- **Fixtures** (`cypress/fixtures/*.json`) = static, reusable, version-controlled data.
- **Factories** (`cypress/factories/`) = dynamic builders returning valid objects by
  default with per-test overrides: `buildUser({ password: 'weak' })`.
- Tests should state only the data that **matters to the scenario**; factories fill
  in the rest. This keeps tests short and resilient to model changes.

## 11. Fail loudly, debug quickly

- Let failures produce evidence: screenshots on failure are on; the mochawesome HTML
  report (`npm run report`) embeds them.
- Don't blanket-swallow application errors. The global `uncaught:exception` handler
  exists only for demoblaze's own third-party script noise — never extend it to hide
  real defects, and prefer scoping such handling to the specific spec that needs it.
- Retries (`runMode: 2`) are a safety net for infrastructure flake, **not** a license
  to merge flaky tests. A test that needs retries to pass gets fixed or deleted.

## 12. Keep the architecture boundaries clean

```
specs (tests/)        → may import: pages, components, factories, fixtures, utils
pages (pages/)        → may import: components, types
components/           → may import: types
factories/, utils/    → may import: types
support/commands.ts   → may import: pages, components, factories
```

- Dependencies point one way. Pages never import specs or commands; components never
  import pages. This keeps every layer replaceable and testable in isolation.
- When demoblaze's UI changes, the fix should touch **one file** (a page object or a
  component) — if a UI change forces edits across many specs, the abstraction is wrong:
  refactor it.
