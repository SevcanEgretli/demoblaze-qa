import BaseModal from './BaseModal';

class LoginModal extends BaseModal {
  constructor() {
    super('#logInModal');
  }

  private get usernameInput() {
    return this.root.find('#loginusername');
  }

  private get passwordInput() {
    return this.root.find('#loginpassword');
  }

  private get logInButton() {
    return this.root.contains('button', 'Log in');
  }

  fillCredentials(username: string, password: string): void {
    this.waitUntilReady();
    this.usernameInput.type(username).should('have.value', username);
    this.passwordInput.type(password, { log: false }).should('have.value', password);
  }

  logIn(username: string, password: string): void {
    this.fillCredentials(username, password);
    this.submit();
  }

  submit(): void {
    this.logInButton.click();
  }

  getUsernameInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.usernameInput;
  }

  getPasswordInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.passwordInput;
  }
}

export default new LoginModal();
