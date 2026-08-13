/**
 * Base class for demoblaze's Bootstrap modals (log in, place order).
 * Centralizes the shared modal shell — root element, close —
 * so each concrete modal only defines its own form fields and submit action.
 */
export default abstract class BaseModal {
  protected constructor(private readonly rootSelector: string) {}

  protected get root() {
    return cy.get(this.rootSelector);
  }

  private get closeButton() {
    return this.root.contains('button', 'Close');
  }

  /**
   * Waits until the modal is fully shown. Bootstrap moves focus to the modal
   * root when its fade-in transition completes — typing before that loses
   * keystrokes to the focus switch, so form actions must call this first.
   * (document.activeElement updates even in an unfocused/headless browser,
   * so this signal is safe in CI.)
   */
  waitUntilReady(): void {
    this.root.should('be.visible').and('have.focus');
  }

  close(): void {
    this.closeButton.click();
  }

  getRoot(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.root;
  }
}
