import { HomePage, NavBar, LoginModal } from '../../../pages';

/**
 * UI login tests. All waits are signal-based: the login API call is
 * intercepted and awaited; alerts are captured via window:alert.
 */
describe('Login (UI)', () => {
  const username = Cypress.env('USERNAME') as string;
  const password = Cypress.env('PASSWORD') as string;

  beforeEach(() => {
    cy.intercept('POST', '**/login').as('loginRequest');
    HomePage.visit();
  });

  it('logs in with valid credentials and greets the user in the navbar', () => {
    NavBar.openLogInModal();
    LoginModal.logIn(username, password);

    cy.wait('@loginRequest').its('response.statusCode').should('equal', 200);
    NavBar.getLoggedInUserLabel()
      .should('be.visible')
      .and('contain.text', `Welcome ${username}`);
  });

  it('shows an error alert when the password is wrong', () => {
    // "Wrong password." is a native window.alert — it has no DOM, so its OK
    // button cannot be selected; Cypress presses OK automatically as soon as
    // the alert fires, and the stub below captures the message.
    const alertStub = cy.stub().as('alert');
    cy.on('window:alert', alertStub);

    NavBar.openLogInModal();
    LoginModal.logIn(username, 'definitely-wrong-password');

    cy.wait('@loginRequest');
    cy.get('@alert').should('have.been.calledOnceWith', 'Wrong password.');

    // After OK is pressed the login modal stays open for another attempt;
    // the user can dismiss it and is still logged out.
    LoginModal.getRoot().should('be.visible');
    LoginModal.close();
    LoginModal.getRoot().should('not.be.visible');
    NavBar.getLogInLink().should('be.visible');
  });

  it('shows an error alert when the user does not exist', () => {
    const alertStub = cy.stub().as('alert');
    cy.on('window:alert', alertStub);
    const ghostUser = `ghost_${Date.now()}_${Cypress._.random(1000, 9999)}`;

    NavBar.openLogInModal();
    LoginModal.logIn(ghostUser, password);

    cy.wait('@loginRequest');
    cy.get('@alert').should('have.been.calledOnceWith', 'User does not exist.');
    NavBar.getLogInLink().should('be.visible');
  });

  it('asks for credentials when the form is submitted empty', () => {
    const alertStub = cy.stub().as('alert');
    cy.on('window:alert', alertStub);

    NavBar.openLogInModal();
    LoginModal.getRoot().should('be.visible');
    LoginModal.submit();

    // Client-side validation: no API call is made for empty credentials.
    cy.get('@alert').should(
      'have.been.calledOnceWith',
      'Please fill out Username and Password.',
    );
  });

  it('retains previously entered credentials when the modal is reopened after Close', () => {
    const randomUsername = `rnd_${Cypress._.random(0, 1e6)}`;
    const randomPassword = `pw_${Cypress._.random(0, 1e6)}`;

    NavBar.openLogInModal();
    LoginModal.fillCredentials(randomUsername, randomPassword);
    LoginModal.close();
    LoginModal.getRoot().should('not.be.visible');

    NavBar.openLogInModal();
    LoginModal.getRoot().should('be.visible');

    // Known demoblaze bug: the form is not reset on Close, so the previous
    // input is still there on reopen — this test pins the current behavior.
    LoginModal.getUsernameInput().should('have.value', randomUsername);
    LoginModal.getPasswordInput().should('have.value', randomPassword);
  });

  it('logs out and returns the navbar to the guest state', () => {
    NavBar.openLogInModal();
    LoginModal.logIn(username, password);
    cy.wait('@loginRequest');
    NavBar.getLoggedInUserLabel().should('contain.text', `Welcome ${username}`);

    NavBar.logOut();

    NavBar.getLogInLink().should('be.visible');
    NavBar.getLoggedInUserLabel().should('not.be.visible');
  });
});
