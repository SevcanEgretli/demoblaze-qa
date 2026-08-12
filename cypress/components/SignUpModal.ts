import BaseModal from './BaseModal';

/**
 * Sign-up modal (navbar → "Sign up"). Shell behavior comes from BaseModal;
 * only the sign-up form lives here.
 */
class SignUpModal extends BaseModal {
  constructor() {
    super('#signInModal');
  }

  // --- Locators -----------------------------------------------------------
  private get usernameInput() {
    return cy.get('#sign-username');
  }

  private get passwordInput() {
    return cy.get('#sign-password');
  }

  private get signUpButton() {
    return this.root.contains('button', 'Sign up');
  }

  // --- Actions ------------------------------------------------------------
  signUp(username: string, password: string): void {
    this.waitUntilReady();
    this.usernameInput.type(username).should('have.value', username);
    this.passwordInput.type(password, { log: false }).should('have.value', password);
    this.signUpButton.click();
  }
}

export default new SignUpModal();
