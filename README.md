# Demoblaze QA — Cypress + TypeScript E2E Suite

Test automation suite for [demoblaze.com](https://www.demoblaze.com), built with
Cypress + TypeScript and the **Page Object Model (POM)**: page elements/actions are kept fully
separate from test scripts. Covers auth, cart, and checkout flows across UI (integration + e2e)
and API layers.

This guide assumes no prior experience setting up a Node/Cypress project — every step below is
what you need to go from a fresh clone to a passing test run.

## 1. Prerequisites

You need two things installed on your machine:

- **Git** — to clone the repository. [Download Git](https://git-scm.com/downloads).
- **Node.js** (which includes `npm`) — to install dependencies and run Cypress.
  [Download Node.js](https://nodejs.org/). This project is pinned to the version in
  [`.nvmrc`](.nvmrc); if you use [nvm](https://github.com/nvm-sh/nvm), run `nvm use` in the
  project folder and it will pick up the right version automatically.

Check both are installed by running in a terminal:

```bash
git --version
node --version
npm --version
```

If any command is "not recognized", (re)install that tool and open a new terminal before
continuing.

## 2. Get the project and install dependencies

```bash
git clone https://github.com/SevcanEgretli/demoblaze-qa.git
cd demoblaze-qa
npm install
```

`npm install` reads `package.json` and downloads Cypress plus every other tool this project
uses into a local `node_modules/` folder. This can take a few minutes the first time.

## 3. Configure credentials

Some tests (login, cart, checkout) act as a real, logged-in demoblaze user, so they need a
real account to log in with:

1. If you don't already have one, go to [demoblaze.com](https://www.demoblaze.com), click
   **Sign up** in the top navigation, and register a username/password.
2. In the project root, copy the example env file:
   ```bash
   cp cypress.env.example.json cypress.env.json
   ```
   (On Windows PowerShell: `Copy-Item cypress.env.example.json cypress.env.json`.)
3. Open `cypress.env.json` and fill in the account you just registered:
   ```json
   {
     "USERNAME": "your_registered_username",
     "PASSWORD": "your_registered_password"
   }
   ```

`cypress.env.json` is git-ignored — it never gets committed, so your credentials stay local.
Never put real credentials in `cypress.env.example.json` or anywhere else in the repo.

## 4. Running the tests

Two ways to run the suite:

**Interactive (recommended the first time)** — opens a browser window where you watch each
test run step by step:

```bash
npm run cy:open
```

Cypress opens a launcher; pick "E2E Testing", choose a browser, and click any spec file in
the list to run it.

**Headless (how CI runs it)** — runs every test in the terminal with no browser window, and
prints a pass/fail summary:

```bash
npm test
```

Other useful scripts:

```bash
npm run test:headed        # like npm test, but shows the browser
npm run test:e2e           # only cypress/tests/e2e/**
npm run test:integration   # only cypress/tests/integration/**
npm run test:api           # only cypress/tests/api/** (no browser needed at all)
npm run report             # open the HTML report from the last run
npm run lint               # check code style
npm run typecheck          # check TypeScript types
```

Every run generates a mochawesome HTML report under `cypress/reports/html/`, with
screenshots embedded for any failure — open it with `npm run report` instead of reading
terminal output.

## 5. Testing approach

### What we considered essential to test, and why

The suite is scoped around the **buyer journey that actually generates revenue on an
e-commerce site**: log in → add a product to the cart → check out. Coverage is deliberately
concentrated here rather than spread thin across every page:

- **Authentication** (`tests/integration/auth`, `tests/api/auth`) — every other flow depends
  on being logged in, so auth bugs have the widest blast radius. Both the happy path and the
  failure modes are covered (wrong password, non-existent user, empty form, session
  persisting across modal reopen, logout) because auth is where users get silently locked
  out if error handling regresses.
- **Cart** (`tests/integration/purchase/cart.spec.ts`, `tests/api/cart`) — adding, removing,
  and totaling items is the core of the shopping experience. The price total is asserted
  explicitly for single and multiple items, because a wrong total is a trust-breaking bug a
  user would notice immediately (and a classic off-by-one/rounding target).
  `tests/api/cart` additionally probes API-only edge cases (malformed tokens, a product id
  that doesn't exist, removing one item without disturbing the rest) that are impractical to
  trigger reliably through the UI.
- **Checkout** (`tests/integration/purchase/checkout.spec.ts`) — this is the conversion
  event: if "Place Order" silently fails or confirms the wrong amount, the business loses
  the sale (or overcharges/undercharges). Both form validation and the confirmed-amount
  matching the cart total are asserted.
- **Add to cart** (`tests/integration/purchase/add-to-cart.spec.ts`) and **products**
  (`tests/api/products`) round out the path from browsing a product to it being addable, and
  confirm the product API contract (list, single-product view, not-found) independently of
  any UI.
- **One full end-to-end journey** (`tests/e2e/purchase-journey.spec.ts`) drives login →
  browse → add to cart → checkout → confirmation through the real UI in one pass, as a
  smoke test that the pieces work together, separate from the more granular
  integration-level specs that test each step in isolation.

Signup and category/pagination browsing were deliberately **left out of scope**: this suite
runs against demoblaze's shared public demo instance (see [Known risks](#known-risks)), and
automating account creation there would accumulate throwaway accounts on infrastructure we
don't own, for a flow (browsing/signup) that carries far less business risk than the
purchase path above.

### How the tests are designed, and why

- **Page Object Model** — specs contain no CSS selectors; every locator lives in
  `cypress/pages/` or `cypress/components/`, and specs call named actions
  (`LoginModal.logIn(...)`) and state readers (`CartPage.getTotalPrice()`). This means a
  demoblaze markup change is fixed in one file instead of hunting across every spec that
  touches that element.
- **Shared UI factored into components** — the navbar and Bootstrap modals appear on
  multiple pages, so they're modeled once (`components/NavBar.ts`, `components/BaseModal.ts`
  and its subclasses) and composed into every page object, instead of being redefined per
  page.
- **API calls to set up state, UI to test behavior** — custom commands
  (`cy.loginByApi`, `cy.addProductToCartByApi`, `cy.clearCartByApi` in
  `support/commands.ts`) seed preconditions (an authenticated session, a pre-filled cart)
  directly via `cy.request`, instead of re-driving login/product-selection UI in every test
  that needs a full cart. This makes tests faster and isolates what each test is actually
  verifying — a cart test failure means the cart is broken, not that an unrelated login
  step flaked.
- **Signal-based waits, never fixed sleeps** — every wait is on something observable:
  `cy.intercept()` + `cy.wait('@alias')` for network calls, or Cypress's built-in retrying
  `.should(...)` for DOM state. `cy.wait(<ms>)` is banned and enforced by ESLint
  (`cypress/no-unnecessary-waiting`), because fixed sleeps are either too slow (wasted CI
  time) or too fast (flaky) — waiting on the actual signal is both faster and reliable.
- **Tests clean up after themselves** — every spec that adds to the cart clears it in
  `afterEach` via `cy.clearCartByApi`, so specs stay independent and repeatable in any order
  or in isolation, and don't leave stale cart state behind on the shared demo account.
  See [Known risks](#known-risks) for what is and isn't cleaned up.
- **Retries are a safety net, not a fix** — `cypress.config.ts` retries a failing test up to
  twice in `runMode` (`retries.runMode: 2`) to absorb infrastructure-level flake (a slow
  public demo server), not to paper over real bugs; a test that only passes on retry gets
  investigated and fixed, not left as is.
- **`id`-first selector strategy, XPath banned** — selectors prefer stable `id` attributes
  (`#login2`), falling back to class/role only where no id exists, and never XPath or
  layout-based selectors (`nth-child`), because those break on any DOM reshuffle.
- **TypeScript strict mode** — shared data shapes (`UserCredentials`, `CheckoutInfo`) are
  typed once in `cypress/types/models.ts`, so a field rename or typo is caught at compile
  time instead of surfacing as a confusing runtime failure mid-test.

Full contribution rules (selector priority, when to add a custom command vs. a page-object
method, etc.) are documented in [`skills/SKILLS.md`](skills/SKILLS.md).

## 6. Project structure

```
demoblaze-qa/
├── cypress/
│   ├── tests/                    # Test scripts ONLY (*.spec.ts) — no locators here
│   │   ├── e2e/                  # Full UI journeys through the browser
│   │   ├── integration/          # Component/flow-level tests (UI + stubbed network)
│   │   └── api/                  # API tests via cy.request (no browser UI)
│   ├── pages/                    # Page Objects — locators + actions ONLY, no assertions
│   │   ├── BasePage.ts           # Navigation + composes NavBar
│   │   ├── HomePage.ts           # Product grid
│   │   ├── ProductPage.ts        # Product detail + Add to cart
│   │   ├── CartPage.ts           # Cart rows, total, Place Order
│   │   └── index.ts              # Barrel export for clean spec imports
│   ├── components/               # Repeated UI shared across pages
│   │   ├── NavBar.ts             # Top navigation (on every page)
│   │   ├── BaseModal.ts          # Shared Bootstrap-modal shell
│   │   ├── LoginModal.ts         # Log-in form (extends BaseModal)
│   │   └── CheckoutModal.ts      # Order form + confirmation (extends BaseModal)
│   ├── fixtures/                 # Static test data (JSON)
│   ├── factories/                # Dynamic test-data builders — to be defined
│   ├── support/
│   │   ├── commands.ts           # Custom commands (cy.loginByApi etc.)
│   │   └── e2e.ts                # Global setup, loaded before every spec
│   ├── utils/
│   │   ├── dataGenerator.ts      # Unique-user generator (no duplicate sign-ups)
│   │   └── encoding.ts           # Password base64 encoding (matches demoblaze's UI)
│   └── types/
│       ├── index.d.ts            # Ambient types for custom commands
│       └── models.ts             # Shared data models (UserCredentials, CheckoutInfo)
├── skills/
│   └── SKILLS.md                 # Project conventions / how-to guides
├── .github/workflows/ci.yml      # Lint + typecheck + Cypress run on push/PR
├── cypress.config.ts             # baseUrl, spec pattern, retries, reporter
├── cypress.env.example.json      # Template for local credentials (copy to cypress.env.json)
├── tsconfig.json
├── .eslintrc.json                # ESLint + Cypress plugin rules
├── .prettierrc
├── .nvmrc                        # Pinned Node version
└── package.json
```

## 7. CI

`.github/workflows/ci.yml` runs on every push/PR to `main`: lint + typecheck first, then the
Cypress suite (needs `CYPRESS_USERNAME` / `CYPRESS_PASSWORD` repo secrets — a registered
demoblaze account, mapped from `cypress.env.json`'s `USERNAME`/`PASSWORD` keys). The
mochawesome report and, on failure, screenshots are uploaded as workflow artifacts.

## Known risks

This suite runs against the real `demoblaze.com`, not a sandbox the team controls:

- **No SLA or change notice** — demoblaze can change markup, copy, or behavior at any time;
  a page object or assertion may need updating with no upstream warning.
- **Shared, rate-limited infrastructure** — it's a public demo instance. Frequent CI runs
  (especially concurrent ones) risk slow responses or throttling; keep CI on a single
  sequential job rather than fanning out in parallel.
- **Cart state is cleaned up, account state is not** — every spec that adds to the cart
  clears it via `cy.clearCartByApi` in `afterEach`. Login tests reuse one fixed account
  (`CYPRESS_USERNAME`/`PASSWORD`) rather than registering new ones, so this suite does not
  accumulate throwaway user accounts on demoblaze.
