/**
 * API-level tests for the cart lifecycle: /addtocart, /viewcart,
 * /deleteitem, /deletecart. Exercises the contract directly, independent
 * of any page rendering.
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
  const laptopId = 8;
  const otherLaptopId = 9;

  let token: string;

  const uniqueCartEntryId = () => `cart-api-${Date.now()}-${Cypress._.random(0, 1e6)}`;

  const viewCart = () =>
    cy.request({ method: 'POST', url: `${apiUrl}/viewcart`, body: { cookie: token, flag: true } });

  beforeEach(() => {
    cy.loginByApi(username, password).then((issuedToken) => {
      token = issuedToken;
    });
  });

  afterEach(() => {
    // Keep the shared demo account's cart clean between test runs.
    cy.clearCartByApi(username);
  });

  it('adds a product to the cart and it appears in /viewcart', () => {
    const entryId = uniqueCartEntryId();

    cy.request({
      method: 'POST',
      url: `${apiUrl}/addtocart`,
      body: { id: entryId, cookie: token, prod_id: laptopId, flag: true },
    }).then((response) => {
      // A successful /addtocart responds 200 with an empty body — there is
      // no success payload to assert on beyond the status; the real proof
      // of success is the item showing up in /viewcart below.
      expect(response.status).to.equal(200);
    });

    viewCart().then((response) => {
      const items = response.body.Items as Array<{ id: string; prod_id: number; cookie: string }>;
      const added = items.find((item) => item.id === entryId);
      expect(added, 'added item present in cart').to.exist;
      expect(added!.prod_id).to.equal(laptopId);
      expect(added!.cookie).to.equal(username);
    });
  });

  it('rejects addtocart with a malformed token', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/addtocart`,
      body: { id: uniqueCartEntryId(), cookie: 'not-a-real-token', prod_id: laptopId, flag: true },
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

    cy.request({
      method: 'POST',
      url: `${apiUrl}/addtocart`,
      body: { id: keepId, cookie: token, prod_id: laptopId, flag: true },
    });
    cy.request({
      method: 'POST',
      url: `${apiUrl}/addtocart`,
      body: { id: removeId, cookie: token, prod_id: otherLaptopId, flag: true },
    });

    cy.request({ method: 'POST', url: `${apiUrl}/deleteitem`, body: { id: removeId } });

    viewCart().then((response) => {
      const ids = (response.body.Items as Array<{ id: string }>).map((item) => item.id);
      expect(ids).to.include(keepId);
      expect(ids).to.not.include(removeId);
    });
  });

  it('clears the entire cart via /deletecart', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/addtocart`,
      body: { id: uniqueCartEntryId(), cookie: token, prod_id: laptopId, flag: true },
    });

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
