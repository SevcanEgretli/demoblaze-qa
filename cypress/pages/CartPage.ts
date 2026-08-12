import BasePage from './BasePage';

/**
 * Cart page (/cart.html): added products with per-item delete links, the
 * order total, and the "Place Order" button that opens the checkout modal.
 */
class CartPage extends BasePage {
  protected readonly path = '/cart.html';

  // --- Locators -----------------------------------------------------------
  private get cartRows() {
    return cy.get('#tbodyid > tr');
  }

  private get totalPrice() {
    return cy.get('#totalp');
  }

  private get placeOrderButton() {
    return cy.contains('button', 'Place Order');
  }

  // --- Actions ------------------------------------------------------------
  placeOrder(): void {
    this.placeOrderButton.click();
  }

  deleteProduct(productName: string): void {
    this.cartRows.contains('tr', productName).contains('Delete').click();
  }

  // --- State readers (specs assert on these) ------------------------------
  getCartRows(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.cartRows;
  }

  getTotalPrice(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.totalPrice;
  }
}

export default new CartPage();
