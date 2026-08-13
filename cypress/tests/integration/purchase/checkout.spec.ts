import { CartPage, CheckoutModal } from '../../../pages';
import type { CheckoutInfo, Product } from '../../../types/models';

/**
 * "Place order" checkout modal. Cart state is seeded via the API, and each
 * test opens the modal itself (via cart.spec.ts-verified CartPage.placeOrder)
 * so this spec is only about the order form and its outcomes.
 *
 * IMPORTANT: demoblaze's purchaseOrder() never calls a create-order API —
 * the confirmation dialog (id, amount, date) is generated entirely
 * client-side from the form input and the cart total already rendered in
 * the page. There is no order-retrieval endpoint, so "was the order
 * correct" can only be verified here, at the UI layer — not via a
 * corresponding API test.
 */
describe('Checkout', () => {
  const username = Cypress.env('USERNAME') as string;
  const password = Cypress.env('PASSWORD') as string;
  let primary: Product;
  let secondary: Product;
  let validOrder: CheckoutInfo;

  before(() => {
    cy.fixture('products').then((fixture: { laptops: Record<string, Product> }) => {
      primary = fixture.laptops.primary;
      secondary = fixture.laptops.secondary;
    });
    cy.fixture('checkout').then((fixture: { validOrder: CheckoutInfo }) => {
      validOrder = fixture.validOrder;
    });
  });

  beforeEach(() => {
    cy.loginByApi(username, password);
    // Clean before use: an interrupted earlier run may have left items behind.
    cy.clearCartByApi(username);
  });

  afterEach(() => {
    // Courtesy cleanup so the shared demo account isn't left with test state.
    cy.clearCartByApi(username);
  });

  it('shows a validation alert when submitting without name and card', () => {
    cy.addProductToCartByApi(primary.id);
    CartPage.visit();
    CartPage.getCartRows().should('have.length', 1);
    CartPage.placeOrder();

    const alertStub = cy.stub().as('alert');
    cy.on('window:alert', alertStub);

    CheckoutModal.purchase();

    cy.get('@alert').should('have.been.calledOnceWith', 'Please fill out Name and Creditcard.');
    // Validation fails before the cart is touched — modal stays open and
    // the order was never "placed".
    CheckoutModal.getRoot().should('be.visible');
  });

  it('completes the purchase and shows a confirmation with the correct amount', () => {
    cy.addProductToCartByApi(primary.id);
    CartPage.visit();
    CartPage.getCartRows().should('have.length', 1);
    CartPage.placeOrder();

    CheckoutModal.fillOrderForm(validOrder);
    cy.intercept('POST', '**/deletecart').as('deleteCart');
    CheckoutModal.purchase();
    cy.wait('@deleteCart');

    CheckoutModal.getConfirmationDialog()
      .should('be.visible')
      .and('contain.text', 'Thank you for your purchase!')
      .and('contain.text', `Amount: ${primary.price} USD`)
      .and('contain.text', validOrder.name);

    CheckoutModal.confirmPurchase();
    cy.url().should('include', 'index.html');

    // The cart must actually be empty afterward — this also exercises the
    // /deletecart-by-username contract documented in commands.ts.
    cy.getCartItemsByApi().should('deep.equal', []);
  });

  it('shows a confirmation amount matching the sum of multiple laptops', () => {
    cy.addProductToCartByApi(primary.id);
    cy.addProductToCartByApi(secondary.id);
    CartPage.visit();
    CartPage.getCartRows().should('have.length', 2);
    CartPage.placeOrder();

    CheckoutModal.fillOrderForm(validOrder);
    cy.intercept('POST', '**/deletecart').as('deleteCart');
    CheckoutModal.purchase();
    cy.wait('@deleteCart');

    CheckoutModal.getConfirmationDialog().should(
      'contain.text',
      `Amount: ${primary.price + secondary.price} USD`,
    );

    CheckoutModal.confirmPurchase();
  });
});
