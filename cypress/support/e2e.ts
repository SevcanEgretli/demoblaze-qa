/**
 * Global support file — loaded before every spec.
 * Register custom commands and global hooks/behaviors here.
 */
import 'cypress-mochawesome-reporter/register';
import './commands';

// Demoblaze occasionally throws uncaught exceptions from its own scripts
// (e.g. third-party ads). Don't fail tests on application-level errors
// that are outside the scope of the suite.
Cypress.on('uncaught:exception', () => {
  return false;
});
