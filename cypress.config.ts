import { defineConfig } from 'cypress';
import mochawesomeReporterPlugin from 'cypress-mochawesome-reporter/plugin';

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports/html',
    charts: true,
    reportPageTitle: 'Demoblaze QA — Test Report',
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  env: {
    apiUrl: 'https://api.demoblaze.com',
  },
  e2e: {
    baseUrl: 'https://www.demoblaze.com',
    specPattern: 'cypress/tests/**/*.spec.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      mochawesomeReporterPlugin(on);
      return config;
    },
  },
  video: false,
  screenshotOnRunFailure: true,
});
