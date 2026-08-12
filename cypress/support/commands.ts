import { encodePassword } from '../utils/encoding';

/**
 * Custom commands. These wrap flows needed by MULTIPLE spec files across
 * different pages (auth, cart seeding) — see skills/SKILLS.md rule 3.
 * Types are declared in cypress/types/index.d.ts; keep both in sync.
 */

const apiUrl = () => Cypress.env('apiUrl') as string;

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
  });
});
