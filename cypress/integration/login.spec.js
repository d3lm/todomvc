/// <reference types="Cypress" />

describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.clearLocalStorage();
  });

  beforeEach(() => {
    cy.get('input#username').as('username');
    cy.get('input#password').as('password');
    cy.get('.login-button').as('loginButton');
  });

  beforeEach(() => {
    cy.server();
    cy.route('POST', '/auth/login').as('login');
  });

  it('should contain welcome message', () => {
    cy.contains('Welcome back!');
  });

  it('should contain username and password field', () => {
    const defaultClasses = 'ng-untouched ng-pristine ng-invalid';

    cy.get('@username')
      .should('have.class', defaultClasses)
      .prev()
      .contains('Username');

    cy.get('@password')
      .should('have.class', defaultClasses)
      .prev()
      .contains('Password');
  });

  it('should be initially disabled', () => {
    cy.get('@loginButton')
      .should('be.disabled')
      .and('have.attr', 'disabled');
  });

  it('should require username and password', () => {
    const inputs = [
      { element: '@username', text: 'foo', error: 'Please enter your username.' },
      { element: '@password', text: 'foo', error: 'Please enter your password.' }
    ];

    cy.wrap(inputs).each(input => {
      const { element, text, error } = input;

      cy.get(element)
        .type(text)
        .should('have.value', text);

      cy.get(element)
        .clear()
        .blur();

      cy.get(element).should('have.class', 'ng-dirty ng-invalid ng-touched');

      cy.get(element)
        .next('.field-error')
        .contains(error);
    });
  });

  it('requires valid username and password', () => {
    cy.get('@username')
      .type('foo')
      .blur();

    cy.get('@password')
      .type('foo')
      .blur();

    cy.get('@loginButton')
      .should('not.be.disabled')
      .and('not.have.attr', 'disabled');

    cy.get('@loginButton').click();

    cy.wait('@login');

    cy.get('@login')
      .its('status')
      .should('eq', 401);

    cy.get('@login')
      .its('statusMessage')
      .should('eq', '401 (Unauthorized)');

    cy.get('.form-error').contains('Incorrect email or password');
  });

  it('resets error state when username or password change', () => {
    cy.get('@username')
      .type('foo')
      .blur();

    cy.get('@password')
      .type('foo')
      .blur();

    cy.get('@loginButton').click();

    cy.get('@username')
      .clear()
      .type('bar')
      .should('have.value', 'bar');

    cy.get('@login').should(req => {
      expect(localStorage.getItem('token')).to.be.null;
    });

    cy.get('.form-error').should('not.be.visible');
  });

  it('should set auth token in localStorage on successful login', () => {
    cy.get('@username')
      .type('ppan')
      .blur();

    cy.get('@password')
      .type('ppan')
      .blur();

    cy.get('@loginButton').click();

    cy.wait('@login');

    cy.get('@login')
      .its('status')
      .should('eq', 200);

    cy.get('@login')
      .its('statusMessage')
      .should('eq', '200 (OK)');

    cy.get('@login').should(req => {
      expect(localStorage.getItem('token')).to.be.eq(req.response.body.accessToken);
    });

    cy.location().should(location => {
      expect(location.pathname).to.eq('/todos');
    });
  });

  it.only('should redirect to /todos on successful login', () => {
    cy.get('@username')
      .type('ppan')
      .blur();

    cy.get('@password')
      .type('ppan')
      .blur();

    cy.get('@loginButton').click();

    cy.location().should(location => {
      expect(location.pathname).to.eq('/todos');
    });
  });
});
