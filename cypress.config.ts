import { appendFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { defineConfig } from 'cypress';
import mochawesomeReporterPlugin from 'cypress-mochawesome-reporter/plugin';

// Append-only, one JSON line per test per run — lets "was this test slow /
// flaky three runs ago too?" be answered with a grep, unlike the per-run
// mochawesome reports. Lives under the git-ignored reports dir; CI persists
// it across runs (cache restore/save) and uploads it as an artifact.
const HISTORY_FILE = 'cypress/reports/history.jsonl';

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

      // Retries are a safety net, not a fix (docs/CONTRIBUTING.md rule 11):
      // a test that only passes on retry must be investigated, so surface
      // every such test loudly instead of letting it hide inside a green
      // run. In GitHub Actions the ::warning line renders as a run
      // annotation; locally it prints to the terminal.
      on('after:spec', (spec, results) => {
        const tests = results?.tests ?? [];

        const passedOnRetry = tests.filter(
          (test) => test.state === 'passed' && test.attempts.length > 1,
        );
        for (const test of passedOnRetry) {
          const message = `Flaky: "${test.title.join(' > ')}" needed ${
            test.attempts.length
          } attempts in ${spec.relative}`;
          if (process.env.GITHUB_ACTIONS) {
            console.log(`::warning title=Flaky test::${message}`);
          } else {
            console.warn(`[flaky-watch] ${message}`);
          }
        }

        // Trend history (see HISTORY_FILE above).
        if (tests.length > 0) {
          const timestamp = new Date().toISOString();
          const lines = tests.map((test) =>
            JSON.stringify({
              timestamp,
              spec: spec.relative,
              test: test.title.join(' > '),
              state: test.state,
              attempts: test.attempts.length,
              durationMs: test.duration,
            }),
          );
          mkdirSync(dirname(HISTORY_FILE), { recursive: true });
          appendFileSync(HISTORY_FILE, `${lines.join('\n')}\n`);
        }
      });

      return config;
    },
  },
  video: false,
  screenshotOnRunFailure: true,
});
