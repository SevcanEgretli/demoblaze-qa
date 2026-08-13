import BasePage from './BasePage';

class CartPage extends BasePage {
  protected readonly path = '/cart.html';

  private get cartRows() {
    return cy.get('#tbodyid > tr');
  }

  private get totalPrice() {
    return cy.get('#totalp');
  }

  private get placeOrderButton() {
    return cy.contains('button', 'Place Order');
  }

  placeOrder(): void {
    this.placeOrderButton.click();
  }

  deleteProduct(productName: string): void {
    this.getProductRow(productName).contains('Delete').click();
  }

  getCartRows(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.cartRows;
  }

  getProductRow(productName: string): Cypress.Chainable<JQuery<HTMLTableRowElement>> {
    return this.cartRows.contains('tr', productName);
  }

  getTotalPrice(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.totalPrice;
  }
}

export default new CartPage();
