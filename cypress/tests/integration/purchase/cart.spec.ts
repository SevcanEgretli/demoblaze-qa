import { CartPage, CheckoutModal } from '../../../pages';
import type { Product } from '../../../types/models';

/**
 * Cart page behavior. Cart state is seeded via the API (cy.loginByApi +
 * cy.addProductToCartByApi) rather than clicking through product selection
 * and "Add to cart" again — those flows are already covered by
 *  add-to-cart.spec.ts. This spec is only
 * about what the cart page itself does with that state.
 */
describe('Cart', () => {
  const username = Cypress.env('USERNAME') as string;
  const password = Cypress.env('PASSWORD') as string;
  let primary: Product;
  let secondary: Product;

  before(() => {
    cy.fixture('products').then((fixture: { laptops: Record<string, Product> }) => {
      primary = fixture.laptops.primary;
      secondary = fixture.laptops.secondary;
    });
  });

  beforeEach(() => {
    cy.loginByApi(username, password);
    // Clean before use: an interrupted earlier run may have left items behind.
    cy.clearCartByApi(username);
  });

  afterEach(() => {
    // Courtesy cleanup so the shared demo account isn't left with test state.
    cy.clearCartByApi(username, { bestEffort: true });
  });

  it('shows the seeded product with its correct name and price', () => {
    cy.addProductToCartByApi(primary.id);
    CartPage.visit();

    CartPage.getCartRows().should('have.length', 1).and('contain.text', primary.title);
    CartPage.getProductRow(primary.title).should('contain.text', String(primary.price));
    CartPage.getTotalPrice().should('have.text', String(primary.price));
  });

  it('reflects the correct total for multiple laptops in the cart', () => {
    cy.addProductToCartByApi(primary.id);
    cy.addProductToCartByApi(secondary.id);
    CartPage.visit();

    CartPage.getCartRows().should('have.length', 2);
    CartPage.getProductRow(primary.title).should('contain.text', String(primary.title));
    CartPage.getProductRow(secondary.title).should('contain.text', String(secondary.title));
    CartPage.getProductRow(primary.title).should('contain.text', String(primary.price));
    CartPage.getProductRow(secondary.title).should('contain.text', String(secondary.price));
    CartPage.getTotalPrice().should('have.text', String(primary.price + secondary.price));
  });

  it('removes a product and updates the total accordingly', () => {
    cy.addProductToCartByApi(primary.id);
    cy.addProductToCartByApi(secondary.id);
    CartPage.visit();
    CartPage.getCartRows().should('have.length', 2);

    // deleteItem() (cart.js) does a full location.reload() on success rather
    // than calling /viewcart directly — the reload's own bootstrap is what
    // fires the single /viewcart call this waits on, so the intercept must
    // be registered before the click.
    cy.intercept('POST', '**/viewcart').as('viewCart');
    CartPage.deleteProduct(primary.title);
    cy.wait('@viewCart');

    CartPage.getCartRows().should('have.length', 1).and('contain.text', secondary.title);
    CartPage.getTotalPrice().should('have.text', String(secondary.price));
  });

  it('opens the checkout modal when Place Order is clicked', () => {
    cy.addProductToCartByApi(primary.id);
    CartPage.visit();
    CartPage.getCartRows().should('have.length', 1);

    CartPage.placeOrder();

    CheckoutModal.getRoot().should('be.visible');
    CheckoutModal.getTotal().should('contain.text', `Total: ${primary.price}`);
    CheckoutModal.getCreditCardInput().should('be.visible');
  });
});
