import NavBar from '../components/NavBar';

/**
 * Base class for all page objects. Provides navigation and composes the
 * components present on every page (navbar), so concrete pages only define
 * what is unique to them.
 */
export default abstract class BasePage {
  /** Shared top navigation, available on every page as `page.navBar`. */
  readonly navBar = NavBar;

  protected abstract readonly path: string;

  visit(): void {
    cy.visit(this.path);
  }
}
