/**
 * Top navigation bar — rendered on every page of demoblaze, so it lives as
 * a shared component instead of being repeated in each page object.
 * Page objects expose it via BasePage (`this.navBar`).
 */
class NavBar {
  // --- Locators -----------------------------------------------------------
  private get homeLink() {
    return cy.get('.navbar-nav').contains('a', 'Home');
  }

  private get signUpLink() {
    return cy.get('#signin2');
  }

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

  // --- Actions ------------------------------------------------------------
  goHome(): void {
    this.homeLink.click();
  }

  openSignUpModal(): void {
    this.signUpLink.click();
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

  // --- State readers (specs assert on these) ------------------------------
  getLoggedInUserLabel(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.loggedInUserLabel;
  }

  getLogInLink(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.logInLink;
  }
}

export default new NavBar();
