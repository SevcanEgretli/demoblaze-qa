import { HomePage, ProductPage, CartPage, NavBar, LoginModal, CheckoutModal } from '../../pages';
import type { CheckoutInfo, Product } from '../../types/models';

/**
 * Full purchase journey, driven entirely through the UI — no API shortcuts.
 * Log in, pick a laptop, add it to the cart, and complete checkout.
 *
 * Smoke test by design: each step keeps only ONE milestone assertion proving
 * the chain advanced; step-level detail (alert texts, totals, status codes)
 * is asserted in the integration/ specs instead, so a detail regression
 * breaks one integration spec — not this journey too.
 *
 * Unique signal vs. integration/: those specs seed state via the API
 * (cy.loginByApi + cy.addProductToCartByApi), so only this spec proves the
 * UI-login session carries through UI add-to-cart and checkout, and only
 * this spec covers picking a product from the home-page grid.
 */
describe('Purchase Journey (E2E)', () => {
  const username = Cypress.env('USERNAME') as string;
  const password = Cypress.env('PASSWORD') as string;
  let laptop: Product;
  let order: CheckoutInfo;

  before(() => {
    cy.fixture('products').then((fixture: { laptops: Record<string, Product> }) => {
      laptop = fixture.laptops.primary;
    });
    cy.fixture('checkout').then((fixture: { validOrder: CheckoutInfo }) => {
      order = fixture.validOrder;
    });
  });

  beforeEach(() => {
    // Clean before use: an interrupted earlier run may have left items behind
    // (the cart is keyed by username, so no login is needed to clear it).
    cy.clearCartByApi(username);
  });

  afterEach(() => {
    // Safety net only: a successful purchase already empties the cart itself
    // (asserted below via the /deletecart wait), this just guards against a
    // failed run leaving state behind for the next one.
    cy.clearCartByApi(username, { bestEffort: true });
  });

  it('logs in, buys a laptop, and confirms the order', () => {
    cy.intercept('POST', '**/login').as('login');
    HomePage.visit();
    NavBar.openLogInModal();
    LoginModal.logIn(username, password);

    cy.wait('@login');
    NavBar.getLoggedInUserLabel().should('be.visible').and('contain.text', `Welcome ${username}`);

    HomePage.selectProduct(laptop.title);
    ProductPage.getProductName().should('be.visible').and('contain.text', laptop.title);

    cy.intercept('POST', '**/addtocart').as('addToCart');
    ProductPage.addToCart();
    cy.wait('@addToCart');

    NavBar.goToCart();
    CartPage.getCartRows().should('have.length', 1).and('contain.text', laptop.title);

    CartPage.placeOrder();
    CheckoutModal.fillOrderForm(order);

    cy.intercept('POST', '**/deletecart').as('deleteCart');
    CheckoutModal.purchase();
    cy.wait('@deleteCart');

    CheckoutModal.getConfirmationDialog()
      .should('be.visible')
      .and('contain.text', 'Thank you for your purchase!')
      .and('contain.text', `Amount: ${laptop.price} USD`);

    CheckoutModal.confirmPurchase();
    cy.url().should('include', 'index.html');
  });
});
