/**
 * Base class for demoblaze's Bootstrap modals (log in, place order).
 */
export default abstract class BaseModal {
  protected constructor(private readonly rootSelector: string) {}

  protected get root() {
    return cy.get(this.rootSelector);
  }

  private get closeButton() {
    return this.root.contains('button', 'Close');
  }

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
