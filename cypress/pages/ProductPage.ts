import BasePage from './BasePage';

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
