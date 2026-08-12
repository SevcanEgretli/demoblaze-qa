/**
 * Base class for demoblaze's Bootstrap modals (sign up, log in, place order).
 * Centralizes the shared modal shell — root element, title, close/dismiss —
 * so each concrete modal only defines its own form fields and submit action.
 */
export default abstract class BaseModal {
  protected constructor(private readonly rootSelector: string) {}

  // --- Shared locators ------------------------------------------------------
  protected get root() {
    return cy.get(this.rootSelector);
  }

  protected get title() {
    return this.root.find('.modal-title');
  }

  private get closeButton() {
    return this.root.contains('button', 'Close');
  }

  private get dismissX() {
    return this.root.find('button.close');
  }

  // --- Shared actions -------------------------------------------------------
  /**
   * Waits until the modal is fully shown. Bootstrap moves focus to the modal
   * root when its fade-in transition completes — typing before that loses
   * keystrokes to the focus switch, so form actions must call this first.
   */
  waitUntilReady(): void {
    this.root.should('be.visible').and('have.focus');
  }

  close(): void {
    this.closeButton.click();
  }

  dismiss(): void {
    this.dismissX.click();
  }

  // --- State readers ----------------------------------------------------------
  getRoot(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.root;
  }

  getTitle(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.title;
  }
}
