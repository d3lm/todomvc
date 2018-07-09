Cypress.Commands.add('getByTestId', id => {
  return cy.get(`[data-cy="${id}"]`);
});

Cypress.Commands.add('login', () => {
  cy.visit('/login');
  cy.clearLocalStorage();

  cy.getByTestId('username')
    .type('ppan')
    .blur();

  cy.getByTestId('password')
    .type('ppan')
    .blur();

  cy.getByTestId('login-button').click();
});
