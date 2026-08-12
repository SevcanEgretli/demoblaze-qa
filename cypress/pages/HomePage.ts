import BasePage from './BasePage';

export type Category = 'Phones' | 'Laptops' | 'Monitors';

/**
 * Home page: category sidebar and the product grid with pagination.
 * Navbar actions come from BasePage (`HomePage.navBar`).
 */
class HomePage extends BasePage {
  protected readonly path = '/';

  // --- Locators -----------------------------------------------------------
  private get categoryList() {
    return cy.get('.list-group a');
  }

  private get productCards() {
    return cy.get('#tbodyid .card-title a');
  }

  private get productPrices() {
    return cy.get('#tbodyid .card h5');
  }

  private get nextButton() {
    return cy.get('#next2');
  }

  private get previousButton() {
    return cy.get('#prev2');
  }

  // --- Actions ------------------------------------------------------------
  selectCategory(category: Category): void {
    this.categoryList.contains(category).click();
  }

  selectProduct(productName: string): void {
    this.productCards.contains(productName).click();
  }

  goToNextPage(): void {
    this.nextButton.click();
  }

  goToPreviousPage(): void {
    this.previousButton.click();
  }

  // --- State readers (specs assert on these) ------------------------------
  getProductCards(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.productCards;
  }

  getProductPrices(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.productPrices;
  }
}

export default new HomePage();
