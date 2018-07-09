/// <reference types="Cypress" />

describe('Todos', () => {
  const TODO_ONE = 'Todo #1';
  const TODO_TWO = 'Todo #2';
  const TODO_THREE = 'Todo #3';

  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.request({
      url: '/api/reset',
      method: 'POST',
      auth: {
        bearer: localStorage.getItem('token')
      }
    });
  });

  it('should focus new-todo input on page load', () => {
    cy.focused().should('have.class', 'new-todo');
  });

  context('No todos', () => {
    it('should hide the main and footer element', () => {
      cy.getByTestId('todo-item').should('have.length', 0);

      cy.getByTestId('main')
        .should('have.length', 0)
        .and('not.be.visible')
        .and('not.exist');

      cy.getByTestId('footer')
        .should('have.length', 0)
        .and('not.be.visible')
        .and('not.exist');
    });
  });

  context('New todos', () => {
    it('should create new todos', () => {
      cy.createTodo(TODO_ONE);

      cy.getByTestId('todo-item').should('have.length', 1);

      cy.createTodo(TODO_TWO);

      cy.getByTestId('todo-item').should('have.length', 2);
    });

    it('should clear text input when an item was added', () => {
      cy.createTodo(TODO_ONE);

      cy.getByTestId('new-todo').should('have.value', '');
    });

    it('should show main and footer for more than one todo item', () => {
      cy.createTodo(TODO_ONE);
      cy.getByTestId('main').should('be.visible');
      cy.getByTestId('footer').should('be.visible');
    });

    it('should append new items to the end of the list', () => {
      cy.createDefaultTodos().as('todos');

      cy.getByTestId('todo-count').contains('3 items left');

      cy.get('@todos')
        .eq(0)
        .find('label')
        .should('contain', TODO_ONE);

      cy.get('@todos')
        .eq(1)
        .find('label')
        .should('contain', TODO_TWO);

      cy.get('@todos')
        .eq(2)
        .find('label')
        .should('contain', TODO_THREE);
    });

    it('should trim text of new todo item', () => {
      cy.createTodo(`  ${TODO_ONE}  `).as('todo');

      cy.get('@todo')
        .find('label')
        .should('contain', TODO_ONE);
    });
  });

  context('Completing todos', () => {
    beforeEach(() => {
      cy.createDefaultTodos().as('todos');
    });

    it('should complete todo', () => {
      cy.get('@todos')
        .eq(0)
        .as('item');

      cy.get('@item')
        .findByTestId('toggle')
        .check();

      cy.get('@item').should('have.class', 'completed');
    });
  });

  context('Editing todos', () => {
    beforeEach(() => {
      cy.createDefaultTodos().as('todos');
    });

    it('should edit a todo', () => {
      const UPDATED_TODO = 'Updated Todo';

      cy.get('@todos')
        .eq(0)
        .find('label')
        .as('item')
        .dblclick();

      cy.getByTestId('edit-todo').should('be.visible');

      cy.focused()
        .clear()
        .type(UPDATED_TODO)
        .type('{enter}');

      cy.getByTestId('edit-todo').should('not.be.visible');

      cy.get('@todos')
        .eq(0)
        .find('label')
        .should('contain', UPDATED_TODO);
    });
  });

  context('Removing todos', () => {
    beforeEach(() => {
      cy.createDefaultTodos().as('todos');
    });

    it('should remove a todo', () => {
      cy.get('@todos')
        .eq(0)
        .findByTestId('destroy')
        .as('destroy');

      cy.get('@destroy').invoke('show');

      cy.get('@destroy').click();

      cy.getByTestId('todo-item').should('have.length', 2);
    });
  });
});
