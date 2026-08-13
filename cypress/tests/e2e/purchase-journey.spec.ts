import { HomePage, ProductPage, CartPage, NavBar, LoginModal, CheckoutModal } from '../../pages';
import type { CheckoutInfo, Product } from '../../types/models';

/**
 * Full purchase journey, driven entirely through the UI — no API shortcuts.
 * Log in, pick a laptop, add it to the cart, and complete checkout.
 * Each step already has isolated coverage in integration/ (auth/login,
 * purchase/add-to-cart, purchase/cart, purchase/checkout); this spec's only
 * job is to prove the steps chain together correctly end to end.
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

  afterEach(() => {
    // Safety net only: a successful purchase already empties the cart itself
    // (asserted below via the /deletecart wait), this just guards against a
    // failed run leaving state behind for the next one.
    cy.clearCartByApi(username);
  });

  it('logs in, buys a laptop, and confirms the order', () => {
    cy.intercept('POST', '**/login').as('login');
    HomePage.visit();
    NavBar.openLogInModal();
    LoginModal.logIn(username, password);

    cy.wait('@login').its('response.statusCode').should('equal', 200);
    NavBar.getLoggedInUserLabel().should('be.visible').and('contain.text', `Welcome ${username}`);

    HomePage.selectProduct(laptop.title);
    ProductPage.getProductName().should('be.visible').and('contain.text', laptop.title);
    ProductPage.getProductPrice().should('contain.text', `$${laptop.price}`);

    const alertStub = cy.stub().as('alert');
    cy.on('window:alert', alertStub);
    cy.intercept('POST', '**/addtocart').as('addToCart');
    ProductPage.addToCart();

    cy.wait('@addToCart').its('response.statusCode').should('equal', 200);
    cy.get('@alert').should('have.been.calledOnceWith', 'Product added.');

    NavBar.goToCart();
    CartPage.getCartRows().should('have.length', 1).and('contain.text', laptop.title);
    CartPage.getTotalPrice().should('have.text', String(laptop.price));

    CartPage.placeOrder();
    CheckoutModal.fillOrderForm(order);

    cy.intercept('POST', '**/deletecart').as('deleteCart');
    CheckoutModal.purchase();
    cy.wait('@deleteCart');

    CheckoutModal.getConfirmationDialog()
      .should('be.visible')
      .and('contain.text', 'Thank you for your purchase!')
      .and('contain.text', `Amount: ${laptop.price} USD`)
      .and('contain.text', order.name);

    CheckoutModal.confirmPurchase();
    cy.url().should('include', 'index.html');
  });
});
