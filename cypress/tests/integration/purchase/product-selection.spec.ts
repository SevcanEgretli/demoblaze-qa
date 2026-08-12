import { HomePage, ProductPage } from '../../../pages';
import type { Product } from '../../../types/models';

/**
 * Covers the two ways a shopper can reach a laptop's product page:
 *  1. picking it directly off the home page grid (including a product that
 *     only appears once the shopper pages forward), and
 *  2. filtering by the "Laptops" category first.
 * No login required — browsing and product detail are public.
 */
describe('Product Selection', () => {
  let laptops: Record<string, Product>;

  before(() => {
    cy.fixture('products').then((fixture: { laptops: Record<string, Product> }) => {
      laptops = fixture.laptops;
    });
  });

  const assertOnProductPage = (laptop: Product) => {
    ProductPage.getProductName().should('be.visible').and('contain.text', laptop.title);
    ProductPage.getProductPrice().should('contain.text', `$${laptop.price}`);
  };

  beforeEach(() => {
    cy.intercept('GET', '**/entries').as('entries');
    HomePage.visit();
    cy.wait('@entries');
  });

  it('opens a laptop selected directly from the home page (page 1)', () => {
    HomePage.selectProduct(laptops.primary.title);
    assertOnProductPage(laptops.primary);
  });

  it('opens a laptop that only appears on the home page\'s 2nd page', () => {
    // NOTE: this relies on the current, live catalog ordering on
    // demoblaze's shared demo API. /entries returns 9 items per page and
    // "MacBook Pro" (id 15) currently falls on page 2. Since /entries is a
    // public, mutable catalog, this could shift if items are ever added —
    // re-verify against the API if this test starts failing on selection.
    cy.intercept('POST', '**/pagination').as('paginate');
    HomePage.goToNextPage();
    cy.wait('@paginate');

    HomePage.selectProduct(laptops.onHomePageTwo.title);
    assertOnProductPage(laptops.onHomePageTwo);
  });

  it('opens a laptop selected via the Laptops category filter', () => {
    cy.intercept('POST', '**/bycat').as('byCategory');
    HomePage.selectCategory('Laptops');
    cy.wait('@byCategory');

    HomePage.selectProduct(laptops.primary.title);
    assertOnProductPage(laptops.primary);
  });
});
