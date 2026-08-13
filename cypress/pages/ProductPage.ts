import BasePage from './BasePage';

/**
 * Product detail page (/prod.html): single product's name, price, and
 * "Add to cart".
 */
class ProductPage extends BasePage {
  protected readonly path = '/prod.html';

  private get productName() {
    return cy.get('.name');
  }

  private get productPrice() {
    return cy.get('.price-container');
  }

  private get addToCartButton() {
    return cy.contains('a', 'Add to cart');
  }

  /**
   * Navigates straight to a product's detail page by id.
   * "idp_" (with the trailing underscore) is demoblaze's real query
   * parameter name — not a typo.
   */
  visitProduct(productId: number): void {
    cy.visit(`${this.path}?idp_=${productId}`);
  }

  addToCart(): void {
    this.addToCartButton.click();
  }

  getProductName(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.productName;
  }

  getProductPrice(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.productPrice;
  }
}

export default new ProductPage();
