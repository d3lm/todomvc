/// <reference types="Cypress" />

describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.clearLocalStorage();
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

    cy.getByTestId('username')
      .should('have.class', defaultClasses)
      .prev()
      .contains('Username');

    cy.getByTestId('password')
      .should('have.class', defaultClasses)
      .prev()
      .contains('Password');
  });

  it('should be initially disabled', () => {
    cy.getByTestId('login-button')
      .should('be.disabled')
      .and('have.attr', 'disabled');
  });

  it('should require username and password', () => {
    const inputs = [
      { element: 'username', text: 'foo', error: 'Please enter your username.' },
      { element: 'password', text: 'foo', error: 'Please enter your password.' }
    ];

    cy.wrap(inputs).each(input => {
      const { element, text, error } = input;

      cy.getByTestId(element)
        .type(text)
        .should('have.value', text);

      cy.getByTestId(element)
        .clear()
        .blur();

      cy.getByTestId(element).should('have.class', 'ng-dirty ng-invalid ng-touched');

      cy.getByTestId(element)
        .next('.field-error')
        .contains(error);
    });
  });

  it('requires valid username and password', () => {
    cy.getByTestId('username')
      .type('foo')
      .blur();

    cy.getByTestId('password')
      .type('foo')
      .blur();

    cy.getByTestId('login-button')
      .should('not.be.disabled')
      .and('not.have.attr', 'disabled');

    cy.getByTestId('login-button').click();

    cy.get('@login')
      .its('status')
      .should('eq', 401);

    cy.get('@login')
      .its('statusMessage')
      .should('eq', '401 (Unauthorized)');

    cy.get('.form-error').contains('Incorrect email or password');
  });

  it('resets error state when username or password change', () => {
    cy.getByTestId('username')
      .type('foo')
      .blur();

    cy.getByTestId('password')
      .type('foo')
      .blur();

    cy.getByTestId('login-button').click();

    cy.getByTestId('username')
      .clear()
      .type('bar')
      .should('have.value', 'bar');

    cy.get('@login').should(req => {
      expect(localStorage.getItem('token')).to.be.null;
    });

    cy.get('.form-error').should('not.be.visible');
  });

  it('should set auth token in localStorage on successful login', () => {
    cy.getByTestId('username')
      .type('ppan')
      .blur();

    cy.getByTestId('password')
      .type('ppan')
      .blur();

    cy.getByTestId('login-button').click();

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

  it('should redirect to /todos on successful login', () => {
    cy.getByTestId('username')
      .type('ppan')
      .blur();

    cy.getByTestId('password')
      .type('ppan')
      .blur();

    cy.getByTestId('login-button').click();

    cy.location().should(location => {
      expect(location.pathname).to.eq('/todos');
    });
  });
});
