import { encodePassword } from '../utils/encoding';
import type { CartItem } from '../types/models';

/**
 * Custom commands for cross-cutting flows (auth, cart seeding). Keep types
 * in cypress/types/index.d.ts in sync.
 *
 * Demoblaze reports API failures as HTTP 200 + { errorMessage }, which
 * cy.request's status check misses — so every command asserts the body
 * itself and fails fast instead of surfacing as a confusing later error.
 */

const apiUrl = () => Cypress.env('apiUrl') as string;

function failOnApiError(body: unknown, context: string): void {
  const errorMessage = (body as { errorMessage?: string } | null)?.errorMessage;
  if (errorMessage) {
    throw new Error(`${context} failed — API returned: "${errorMessage}"`);
  }
}

/** Logs in via the API and sets the "tokenp_" session cookie. Returns the token. */
Cypress.Commands.add('loginByApi', (username: string, password: string) => {
  return cy
    .request({
      method: 'POST',
      url: `${apiUrl()}/login`,
      body: { username, password: encodePassword(password) },
    })
    .then((response) => {
      failOnApiError(response.body, `loginByApi("${username}")`);
      const token = (response.body as string).replace('Auth_token: ', '');
      return cy.setCookie('tokenp_', token).then(() => token);
    });
});

/** Adds a product to the cart via the API, for seeding state. Requires loginByApi first. */
Cypress.Commands.add('addProductToCartByApi', (productId: number) => {
  cy.getCookie('tokenp_').then((cookie) => {
    if (!cookie) {
      throw new Error('addProductToCartByApi requires an active session — call cy.loginByApi first.');
    }
    cy.request({
      method: 'POST',
      url: `${apiUrl()}/addtocart`,
      body: {
        id: `cart-${Date.now()}-${Cypress._.random(0, 1e6)}`,
        cookie: cookie.value,
        prod_id: productId,
        flag: true,
      },
    }).then((response) => {
      failOnApiError(response.body, `addProductToCartByApi(${productId})`);
    });
  });
});

/** Returns the authenticated user's cart items via /viewcart. Requires loginByApi first. */
Cypress.Commands.add('getCartItemsByApi', () => {
  return cy.getCookie('tokenp_').then((cookie) => {
    if (!cookie) {
      throw new Error('getCartItemsByApi requires an active session — call cy.loginByApi first.');
    }
    return cy
      .request({
        method: 'POST',
        url: `${apiUrl()}/viewcart`,
        body: { cookie: cookie.value, flag: true },
      })
      .then((response) => {
        failOnApiError(response.body, 'getCartItemsByApi');
        return response.body.Items as CartItem[];
      });
  });
});

/**
 * Clears the given user's cart via the API.
 * NOTE: /deletecart keys the cart by USERNAME, not by token — confirmed via
 * /viewcart's "cookie" field, and matches the app's own cart.js behavior.
 * Intentional, not a bug.
 *
 * `bestEffort` is for afterEach courtesy cleanup only: failures are ignored
 * so a transient API blip can't fail a test that already passed. The strict
 * default stays the correctness guarantee for beforeEach clean-before-use.
 */
Cypress.Commands.add('clearCartByApi', (username: string, options?: { bestEffort?: boolean }) => {
  const bestEffort = options?.bestEffort ?? false;
  cy.request({
    method: 'POST',
    url: `${apiUrl()}/deletecart`,
    body: { cookie: username },
    failOnStatusCode: !bestEffort,
  }).then((response) => {
    if (!bestEffort) {
      failOnApiError(response.body, `clearCartByApi("${username}")`);
    }
  });
});
