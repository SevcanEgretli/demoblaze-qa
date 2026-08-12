import { ProductPage } from '../../../pages';
import type { Product } from '../../../types/models';

/**
 * "Add to cart" from the product detail page. Starts directly on the
 * product page (bypassing home-page selection, already covered by
 * product-selection.spec.ts) so this spec isolates only the add-to-cart
 * behavior itself.
 */
describe('Add to Cart', () => {
  const apiUrl = Cypress.env('apiUrl') as string;
  const username = Cypress.env('USERNAME') as string;
  const password = Cypress.env('PASSWORD') as string;
  let laptop: Product;

  before(() => {
    cy.fixture('products').then((fixture: { laptops: Record<string, Product> }) => {
      laptop = fixture.laptops.primary;
    });
  });

  beforeEach(() => {
    cy.loginByApi(username, password);
  });

  afterEach(() => {
    cy.clearCartByApi(username);
  });

  it('adds the product to the cart and confirms with an alert', () => {
    const alertStub = cy.stub().as('alert');
    cy.on('window:alert', alertStub);
    cy.intercept('POST', '**/addtocart').as('addToCart');

    ProductPage.visitProduct(laptop.id);
    ProductPage.addToCart();

    cy.wait('@addToCart').its('response.statusCode').should('equal', 200);
    // Logged-in users see "Product added." (with a trailing period) —
    // guests see "Product added" without one, so this text also confirms
    // the request carried a valid session.
    cy.get('@alert').should('have.been.calledOnceWith', 'Product added.');

    cy.getCookie('tokenp_').then((cookie) => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/viewcart`,
        body: { cookie: cookie!.value, flag: true },
      }).then((response) => {
        const items = response.body.Items as Array<{ prod_id: number }>;
        expect(items.map((item) => item.prod_id)).to.include(laptop.id);
      });
    });
  });
});
