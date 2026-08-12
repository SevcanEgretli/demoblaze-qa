/// <reference types="cypress" />

/**
 * Ambient type declarations for custom Cypress commands defined in
 * cypress/support/commands.ts. Keep this file in sync with that one.
 */
declare namespace Cypress {
  interface Chainable {
    /**
     * Logs in via the API and sets the session cookie. Returns the token.
     * Use for specs that need an authenticated session but are not
     * testing the login flow itself.
     */
    loginByApi(username: string, password: string): Chainable<string>;

    /**
     * Adds a product to the authenticated user's cart via the API.
     * Requires loginByApi to have run first in the same test.
     */
    addProductToCartByApi(productId: number): Chainable<void>;

    /** Clears the given user's cart via the API (keyed by username). */
    clearCartByApi(username: string): Chainable<void>;
  }
}
