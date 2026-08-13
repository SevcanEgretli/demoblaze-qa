/**
 * Base class for all page objects. Concrete pages define their path and
 * whatever locators/actions are unique to them.
 */
export default abstract class BasePage {
  protected abstract readonly path: string;

  visit(): void {
    cy.visit(this.path);
  }
}
