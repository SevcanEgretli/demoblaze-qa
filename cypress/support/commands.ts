import { encodePassword } from '../utils/encoding';
import type { CartItem } from '../types/models';

/**
 * Custom commands. These wrap flows needed by MULTIPLE spec files across
 * different pages (auth, cart seeding) — see docs/CONTRIBUTING.md.
 * Types are declared in cypress/types/index.d.ts; keep both in sync.
 *
 * Demoblaze's API reports failures as HTTP 200 with an { errorMessage } body,
 * so cy.request's built-in non-2xx check never catches them. Every command
 * below asserts the body itself, so a failed setup step fails the test
 * immediately with a clear message instead of surfacing minutes later as an
 * unrelated assertion.
 */

const apiUrl = () => Cypress.env('apiUrl') as string;

function failOnApiError(body: unknown, context: string): void {
  const errorMessage = (body as { errorMessage?: string } | null)?.errorMessage;
  if (errorMessage) {
    throw new Error(`${context} failed — API returned: "${errorMessage}"`);
  }
}

/**
 * Logs in directly against the API (mirrors the exact request the UI sends)
 * and sets the "tokenp_" session cookie, so specs that are not testing the
 * login flow itself can start from an authenticated state without driving
 * the login UI. Returns the resolved token.
 */
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

/**
 * Adds a product to the currently authenticated cart via the API — used to
 * seed cart state for cart/checkout specs so they don't have to re-drive
 * product selection and "Add to cart" UI just to get to their starting
 * point. Requires cy.loginByApi to have run first in the same test.
 */
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

/**
 * Returns the authenticated user's cart items via /viewcart.
 * Requires cy.loginByApi to have run first in the same test.
 */
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
 * Clears every item in the given user's cart via the API.
 *
 * NOTE: /deletecart keys the cart by USERNAME, not by the auth token —
 * confirmed by inspecting stored cart items via /viewcart, whose "cookie"
 * field holds the plain username even though /addtocart was called with the
 * token. This matches what the app itself does (cart.js's purchaseOrder()
 * calls deleteCart(usern), the username from /check — not the token), so
 * this command follows the same contract intentionally, not by mistake.
 */
Cypress.Commands.add('clearCartByApi', (username: string) => {
  cy.request({
    method: 'POST',
    url: `${apiUrl()}/deletecart`,
    body: { cookie: username },
  }).then((response) => {
    failOnApiError(response.body, `clearCartByApi("${username}")`);
  });
});
