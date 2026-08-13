/**
 * Global support file — loaded before every spec.
 * Register custom commands and global hooks/behaviors here.
 */
import 'cypress-mochawesome-reporter/register';
import './commands';

// Fail fast with an actionable message when local credentials are missing,
// instead of a confusing mid-test failure (cy.type into undefined, etc.).
before(() => {
  for (const key of ['USERNAME', 'PASSWORD'] as const) {
    const value = Cypress.env(key) as unknown;
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(
        `Missing Cypress.env('${key}') — copy cypress.env.example.json to cypress.env.json ` +
          'and fill in a registered demoblaze account (see README, "Configure credentials").',
      );
    }
  }
});

// Demoblaze loads third-party scripts (ads/analytics) that occasionally
// throw; cross-origin scripts surface only as the opaque "Script error." —
// safe to ignore. Anything else is a real application error and must fail
// the test: never widen this filter to hide an actual defect.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Script error')) {
    return false;
  }
});
