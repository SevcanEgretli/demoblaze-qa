import { encodePassword } from '../../../utils/encoding';

/**
 * API-level login tests against https://api.demoblaze.com/login.
 *
 * Contract (mirrored from the site's js/index.js):
 *  - request body: { username, password } with the password base64-encoded
 *  - success: 200 with the body string "Auth_token: <token>"
 *  - failure: 200 with { errorMessage: "Wrong password." | "User does not exist." }
 */
describe('Login API', () => {
  const apiUrl = Cypress.env('apiUrl') as string;
  const username = Cypress.env('USERNAME') as string;
  const password = Cypress.env('PASSWORD') as string;

  const postLogin = (body: { username: string; password: string }) =>
    cy.request({ method: 'POST', url: `${apiUrl}/login`, body });

  it('returns an auth token for valid credentials', () => {
    postLogin({ username, password: encodePassword(password) }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.a('string');
      expect(response.body).to.match(/^Auth_token: \S+/);
    });
  });

  it('rejects a valid user with a wrong password', () => {
    postLogin({ username, password: encodePassword('definitely-wrong-password') }).then(
      (response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({ errorMessage: 'Wrong password.' });
      },
    );
  });

  it('rejects a user that does not exist', () => {
    const ghostUser = `ghost_${Date.now()}_${Cypress._.random(1000, 9999)}`;
    postLogin({ username: ghostUser, password: encodePassword(password) }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({ errorMessage: 'User does not exist.' });
    });
  });

  it('rejects a password that is not base64-encoded like the UI sends it', () => {
    // The API compares against the stored base64 value, so sending the plain
    // password must NOT authenticate.
    postLogin({ username, password }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({ errorMessage: 'Wrong password.' });
    });
  });
});
