import BaseModal from './BaseModal';

/**
 * Log-in modal (navbar → "Log in"). Shell behavior comes from BaseModal;
 * only the login form lives here.
 */
class LoginModal extends BaseModal {
  constructor() {
    super('#logInModal');
  }

  // --- Locators -----------------------------------------------------------
  private get usernameInput() {
    return cy.get('#loginusername');
  }

  private get passwordInput() {
    return cy.get('#loginpassword');
  }

  private get logInButton() {
    return this.root.contains('button', 'Log in');
  }

  // --- Actions ------------------------------------------------------------
  /** Types into the username/password fields without submitting the form. */
  fillCredentials(username: string, password: string): void {
    this.waitUntilReady();
    this.usernameInput.type(username).should('have.value', username);
    this.passwordInput.type(password, { log: false }).should('have.value', password);
  }

  logIn(username: string, password: string): void {
    this.fillCredentials(username, password);
    this.submit();
  }

  /** Clicks "Log in" without filling the form (empty-credentials scenario). */
  submit(): void {
    this.logInButton.click();
  }

  // --- State readers (specs assert on these) -------------------------------
  getUsernameInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.usernameInput;
  }

  getPasswordInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.passwordInput;
  }
}

export default new LoginModal();
