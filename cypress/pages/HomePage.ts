import BasePage from './BasePage';

/**
 * Home page: product grid.
 * Navbar actions come from BasePage (`HomePage.navBar`).
 */
class HomePage extends BasePage {
  protected readonly path = '/';

  // --- Locators -----------------------------------------------------------
  private get productCards() {
    return cy.get('#tbodyid .card-title a');
  }

  // --- Actions ------------------------------------------------------------
  selectProduct(productName: string): void {
    this.productCards.contains(productName).click();
  }
}

export default new HomePage();
