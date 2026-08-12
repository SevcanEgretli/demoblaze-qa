# Demoblaze QA — Cypress + TypeScript E2E Suite

Test automation project skeleton for [demoblaze.com](https://www.demoblaze.com), built with
Cypress + TypeScript and the **Page Object Model (POM)**: page elements/actions are kept fully
separate from test scripts. No test cases yet — structure and configuration only.

## Project Structure

```
demoblaze-qa/
├── cypress/
│   ├── tests/                    # Test scripts ONLY (*.spec.ts) — no locators here
│   │   ├── e2e/                  # Full UI journeys through the browser
│   │   ├── integration/          # Component/flow-level tests (UI + stubbed network)
│   │   └── api/                  # API tests via cy.request (no browser UI)
│   ├── pages/                    # Page Objects — locators + actions ONLY, no assertions
│   │   ├── BasePage.ts           # Navigation + composes NavBar
│   │   ├── HomePage.ts           # Categories, product grid, pagination
│   │   ├── ProductPage.ts        # Product detail + Add to cart
│   │   ├── CartPage.ts           # Cart rows, total, Place Order
│   │   └── index.ts              # Barrel export for clean spec imports
│   ├── components/               # Repeated UI shared across pages
│   │   ├── NavBar.ts             # Top navigation (on every page)
│   │   ├── BaseModal.ts          # Shared Bootstrap-modal shell
│   │   ├── SignUpModal.ts        # Sign-up form (extends BaseModal)
│   │   ├── LoginModal.ts         # Log-in form (extends BaseModal)
│   │   └── CheckoutModal.ts      # Order form + confirmation (extends BaseModal)
│   ├── fixtures/                 # Static test data (JSON) — to be defined
│   ├── factories/                # Dynamic test-data builders — to be defined
│   ├── support/
│   │   ├── commands.ts           # Custom commands (add cy.login etc. here)
│   │   └── e2e.ts                # Global setup, loaded before every spec
│   ├── utils/
│   │   └── dataGenerator.ts      # Unique-user generator (no duplicate sign-ups)
│   └── types/
│       ├── index.d.ts            # Ambient types for custom commands
│       └── models.ts             # Shared data models (UserCredentials, CheckoutInfo)
├── skills/
│   └── SKILLS.md                 # Project conventions / how-to guides
├── cypress.config.ts             # baseUrl, spec pattern, retries, reporter
├── cypress.env.example.json      # Template for local credentials (copy to cypress.env.json)
├── tsconfig.json
├── .eslintrc.json                # ESLint + Cypress plugin rules
├── .prettierrc
└── package.json
```

## Conventions

- **POM separation** — Specs never contain CSS selectors. All locators live in `cypress/pages/`;
  specs call public action methods and assert on public state readers.
- **Page objects hold no assertions** — Assertions belong in specs.
- **Repeated UI lives in components** — The navbar and the Bootstrap modals appear across
  pages, so they are modeled once in `cypress/components/` and composed into pages
  (every page object exposes `navBar` via `BasePage`).
- **Fixtures for static data, factories for dynamic data** — Reusable JSON datasets go in
  `cypress/fixtures/`; programmatic builders (unique users, order variations) go in
  `cypress/factories/`.
- **Secrets stay local** — Real credentials go in `cypress.env.json` (git-ignored).
- **Test files** use the `.spec.ts` extension and live under `cypress/tests/`.

## Scripts

```bash
npm install

npm run cy:open            # interactive runner
npm test                   # run all specs headless
npm run test:headed        # run headed in Chrome
npm run test:e2e           # run one layer (also: test:integration, test:api)
npm run report             # open the HTML report (cypress/reports/html/index.html)
npm run lint               # ESLint
npm run format             # Prettier
```

Every `cypress run` generates a mochawesome HTML report under `cypress/reports/html/`
with embedded screenshots for failures.
