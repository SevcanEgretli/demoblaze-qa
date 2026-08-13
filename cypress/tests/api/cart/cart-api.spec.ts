import type { CartItem, Product } from '../../../types/models';

/**
 * API-level tests for the cart lifecycle: /addtocart, /viewcart,
 * /deleteitem, /deletecart. Exercises the contract directly, independent
 * of any page rendering — requests are built raw on purpose rather than
 * through the higher-level custom commands.
 *
 * Cart identity quirk (verified manually against the live API): items are
 * stored keyed by USERNAME (/viewcart returns each item's "cookie" field as
 * the plain username), even though /addtocart is called with the auth
 * TOKEN. /deletecart only matches when called with the username. This
 * mirrors the app's own code (cart.js's purchaseOrder() clears the cart by
 * username, not by token) — tests below use each endpoint with the identity
 * it actually expects.
 */
describe('Cart API', () => {
  const apiUrl = Cypress.env('apiUrl') as string;
  const username = Cypress.env('USERNAME') as string;
  const password = Cypress.env('PASSWORD') as string;
  let laptop: Product;
  let otherLaptop: Product;

  let token: string;

  const uniqueCartEntryId = () => `cart-api-${Date.now()}-${Cypress._.random(0, 1e6)}`;

  const addToCart = (entryId: string, productId: number) =>
    cy.request({
      method: 'POST',
      url: `${apiUrl}/addtocart`,
      body: { id: entryId, cookie: token, prod_id: productId, flag: true },
    });

  const viewCart = () =>
    cy.request({ method: 'POST', url: `${apiUrl}/viewcart`, body: { cookie: token, flag: true } });

  before(() => {
    cy.fixture('products').then((fixture: { laptops: Record<string, Product> }) => {
      laptop = fixture.laptops.primary;
      otherLaptop = fixture.laptops.secondary;
    });
  });

  beforeEach(() => {
    cy.loginByApi(username, password).then((issuedToken) => {
      token = issuedToken;
    });
    // Clean before use: an interrupted earlier run may have left items behind.
    cy.clearCartByApi(username);
  });

  afterEach(() => {
    // Keep the shared demo account's cart clean between test runs.
    cy.clearCartByApi(username, { bestEffort: true });
  });

  it('adds a product to the cart and it appears in /viewcart', () => {
    const entryId = uniqueCartEntryId();

    addToCart(entryId, laptop.id).then((response) => {
      // A successful /addtocart responds 200 with an empty body — there is
      // no success payload to assert on beyond the status; the real proof
      // of success is the item showing up in /viewcart below.
      expect(response.status).to.equal(200);
    });

    viewCart().then((response) => {
      const items = response.body.Items as CartItem[];
      const added = items.find((item) => item.id === entryId);
      expect(added, 'added item present in cart').to.exist;
      expect(added!.prod_id).to.equal(laptop.id);
      expect(added!.cookie).to.equal(username);
    });
  });

  it('rejects addtocart with a malformed token', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/addtocart`,
      body: { id: uniqueCartEntryId(), cookie: 'not-a-real-token', prod_id: laptop.id, flag: true },
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({ errorMessage: 'Bad parameter, token malformed.' });
    });
  });

  it('rejects viewcart with a malformed token', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/viewcart`,
      body: { cookie: 'not-a-real-token', flag: true },
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({ errorMessage: 'Bad parameter, token malformed.' });
    });
  });

  it('removes exactly the targeted item via /deleteitem, leaving others intact', () => {
    const keepId = uniqueCartEntryId();
    const removeId = uniqueCartEntryId();

    addToCart(keepId, laptop.id);
    addToCart(removeId, otherLaptop.id);

    cy.request({ method: 'POST', url: `${apiUrl}/deleteitem`, body: { id: removeId } }).then(
      (response) => {
        expect(response.status).to.equal(200);
      },
    );

    viewCart().then((response) => {
      const ids = (response.body.Items as CartItem[]).map((item) => item.id);
      expect(ids).to.include(keepId);
      expect(ids).to.not.include(removeId);
    });
  });

  it('allows multiple products to be added to the cart', () => {
    const firstEntryId = uniqueCartEntryId();
    const secondEntryId = uniqueCartEntryId();

    addToCart(firstEntryId, laptop.id).then((response) => {
      expect(response.status).to.equal(200);
    });
    addToCart(secondEntryId, otherLaptop.id).then((response) => {
      expect(response.status).to.equal(200);
    });

    viewCart().then((response) => {
      const items = response.body.Items as CartItem[];
      expect(items.find((item) => item.id === firstEntryId)?.prod_id).to.equal(laptop.id);
      expect(items.find((item) => item.id === secondEntryId)?.prod_id).to.equal(otherLaptop.id);
    });
  });

  // /addtocart doesn't validate prod_id — it silently stores any id with no
  // errorMessage. Documenting this actual (surprising) contract, not a bug.
  it('accepts addtocart for a product id that does not exist, without validation', () => {
    const entryId = uniqueCartEntryId();
    const nonExistentProductId = 999999;

    addToCart(entryId, nonExistentProductId).then((response) => {
      expect(response.status).to.equal(200);
    });

    viewCart().then((response) => {
      const items = response.body.Items as CartItem[];
      expect(items.find((item) => item.id === entryId)?.prod_id).to.equal(nonExistentProductId);
    });
  });

  it('clears the entire cart via /deletecart', () => {
    addToCart(uniqueCartEntryId(), laptop.id);

    cy.request({ method: 'POST', url: `${apiUrl}/deletecart`, body: { cookie: username } }).then(
      (response) => {
        expect(response.status).to.equal(200);
      },
    );

    viewCart().then((response) => {
      expect(response.body.Items).to.deep.equal([]);
    });
  });
});
