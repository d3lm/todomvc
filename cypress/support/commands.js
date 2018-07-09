Cypress.Commands.add('getByTestId', id => {
  return cy.get(`[data-cy="${id}"]`);
});

Cypress.Commands.add('findByTestId', { prevSubject: 'element' }, (subject, id) => {
  return cy.wrap(subject).find(`[data-cy="${id}"]`);
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

Cypress.Commands.add('createTodo', todo => {
  cy.getByTestId('new-todo')
    .type(todo)
    .type('{enter}');

  return cy.getByTestId('todo-item');
});

Cypress.Commands.add('createDefaultTodos', () => {
  const TODOS = ['Todo #1', 'Todo #2', 'Todo #3'];

  cy.wrap(TODOS).each(todo => {
    cy.getByTestId('new-todo')
      .type(todo)
      .type('{enter}');
  });

  return cy.getByTestId('todo-item');
});
