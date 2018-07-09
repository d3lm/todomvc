Cypress.Commands.add('getByTestId', id => {
  return cy.get(`[data-cy="${id}"]`);
});
