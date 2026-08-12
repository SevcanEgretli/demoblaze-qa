import type { Product } from '../../../types/models';

interface CatalogEntry {
  id: number;
  title: string;
  price: number;
}

/**
 * API-level tests for the read-only catalog endpoints used by the purchase
 * flow: /bycat (category filter) and /view (product detail). Public
 * endpoints — no auth required.
 */
describe('Products API', () => {
  const apiUrl = Cypress.env('apiUrl') as string;
  let laptops: Record<string, Product>;

  before(() => {
    cy.fixture('products').then((fixture: { laptops: Record<string, Product> }) => {
      laptops = fixture.laptops;
    });
  });

  it('lists all fixture laptops under the "notebook" category', () => {
    cy.request({ method: 'POST', url: `${apiUrl}/bycat`, body: { cat: 'notebook' } }).then(
      (response) => {
        expect(response.status).to.equal(200);
        const items = response.body.Items as CatalogEntry[];

        Object.values(laptops).forEach((laptop) => {
          const found = items.find((item) => item.id === laptop.id);
          expect(found, `laptop id ${laptop.id} present in /bycat`).to.exist;
          // Some catalog titles carry trailing whitespace server-side (e.g.
          // "Sony vaio i7\n") — compare trimmed, not exact equality.
          expect(found!.title.trim()).to.equal(laptop.title);
          expect(found!.price).to.equal(laptop.price);
        });
      },
    );
  });

  it('returns full product details for a known laptop via /view', () => {
    const laptop = laptops.primary;

    cy.request({
      method: 'POST',
      url: `${apiUrl}/view`,
      body: { id: String(laptop.id) },
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.id).to.equal(laptop.id);
      expect(response.body.title.trim()).to.equal(laptop.title);
      expect(response.body.price).to.equal(laptop.price);
    });
  });

  it('returns "Not found." for a product id that does not exist', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/view`,
      body: { id: '999999' },
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({ errorMessage: 'Not found.' });
    });
  });
});
