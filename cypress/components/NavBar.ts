/**
 * Top navigation bar — rendered on every page of demoblaze.
 */
class NavBar {
  private get logInLink() {
    return cy.get('#login2');
  }

  private get logOutLink() {
    return cy.get('#logout2');
  }

  private get cartLink() {
    return cy.get('#cartur');
  }

  private get loggedInUserLabel() {
    return cy.get('#nameofuser');
  }

  openLogInModal(): void {
    this.logInLink.click();
  }

  logOut(): void {
    this.logOutLink.click();
  }

  goToCart(): void {
    this.cartLink.click();
  }

  getLoggedInUserLabel(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.loggedInUserLabel;
  }

  getLogInLink(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.logInLink;
  }
}

export default new NavBar();
