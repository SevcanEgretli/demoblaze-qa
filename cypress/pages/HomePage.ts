import BasePage from './BasePage';

class HomePage extends BasePage {
  protected readonly path = '/';

  private get productCards() {
    return cy.get('#tbodyid .card-title a');
  }

  selectProduct(productName: string): void {
    this.productCards.contains(productName).click();
  }
}

export default new HomePage();
