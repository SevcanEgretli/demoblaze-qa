/**
 * Data factories — programmatic builders for test data.
 *
 * Convention (to be filled in later):
 *  - One factory per domain model (userFactory.ts, orderFactory.ts, ...).
 *  - A factory returns a valid object by default and accepts overrides:
 *
 *      export function buildUser(overrides: Partial<UserCredentials> = {}): UserCredentials {
 *        return { username: `qa_${Date.now()}`, password: 'Secret1!', ...overrides };
 *      }
 *
 *  - Static, reusable datasets stay in cypress/fixtures (JSON); factories are
 *    for dynamic/unique data (demoblaze rejects duplicate usernames).
 *
 * Re-export all factories from this barrel file.
 */
export {};
