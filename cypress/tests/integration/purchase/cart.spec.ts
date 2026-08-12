import { CartPage, CheckoutModal } from '../../../pages';
import type { Product } from '../../../types/models';

/**
 * Cart page behavior. Cart state is seeded via the API (cy.loginByApi +
 * cy.addProductToCartByApi) rather than clicking through product selection
 * and "Add to cart" again — those flows are already covered by
 * product-selection.spec.ts and add-to-cart.spec.ts. This spec is only
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
  });

  afterEach(() => {
    cy.clearCartByApi(username);
  });

  it('shows the seeded product with its correct name and price', () => {
    cy.addProductToCartByApi(primary.id);
    CartPage.visit();

    CartPage.getCartRows().should('have.length', 1).and('contain.text', primary.title);
    CartPage.getTotalPrice().should('have.text', String(primary.price));
  });

  it('reflects the correct total for multiple laptops in the cart', () => {
    cy.addProductToCartByApi(primary.id);
    cy.addProductToCartByApi(secondary.id);
    CartPage.visit();

    CartPage.getCartRows().should('have.length', 2);
    CartPage.getCartRows().should('contain.text', primary.title).and('contain.text', secondary.title);
    CartPage.getTotalPrice().should('have.text', String(primary.price + secondary.price));
  });

  it('removes a product and updates the total accordingly', () => {
    cy.addProductToCartByApi(primary.id);
    cy.addProductToCartByApi(secondary.id);
    CartPage.visit();
    CartPage.getCartRows().should('have.length', 2);

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
  });
});
