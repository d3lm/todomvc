import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TodoService } from '../todo.service';
import { Todo } from '../../models/todo';
import { tap, switchMapTo } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { staggerTodos } from './todo-list.animations';

enum Filter {
  ALL = 'SHOW_ALL',
  ACTIVE = 'SHOW_ACTIVE',
  COMPLETED = 'SHOW_COMPLETED'
}

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  animations: [staggerTodos]
})
export class TodoListComponent implements OnInit {
  newTodo = '';
  currentTodo: Todo;
  todos: Array<Todo> = [];
  todoFilter = Filter.ALL;

  completed = 0;
  remaining = 0;
  allCompleted = false;

  get filteredTodos() {
    this.completed = 0;
    this.remaining = 0;
    this.todos.forEach(todo => (todo.completed ? this.completed++ : this.remaining++));
    this.allCompleted = this.todos.length === this.completed;
    return this.todos.filter(todo => this.filterTodo(todo));
  }

  constructor(private authService: AuthService, private todoService: TodoService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.todoService
      .getTodos()
      .pipe(
        tap(todos => (this.todos = todos)),
        switchMapTo(this.route.params)
      )
      .subscribe(params => {
        this.todoFilter = this.filterFromString(params['filter']);
      });
  }

  logout() {
    this.authService.logout();
  }

  addTodo(todo: string) {
    if (todo.trim().length === 0) {
      return;
    }

    this.cancelEdit();

    this.todoService.createTodo(todo.trim()).subscribe(newTodo => {
      this.newTodo = '';
      this.todos.push(newTodo);
    });
  }

  toggleAll(completed: boolean) {
    this.cancelEdit();
    this.todoService.toggleAll(completed).subscribe(todos => (this.todos = todos));
  }

  toggle(todo: Todo) {
    this.cancelEdit();
    todo.completed = !todo.completed;
    this.todoService.updateTodo(todo).subscribe();
  }

  edit(todo: Todo) {
    this.currentTodo = todo;
  }

  update(todo: Todo) {
    if (!todo.title) {
      this.delete(todo);
      return;
    }

    this.cancelEdit();
    this.todoService.updateTodo(todo).subscribe();
  }

  delete(todo: Todo) {
    this.cancelEdit();

    this.todoService.deleteTodo(todo.id).subscribe(_ => {
      this.todos = this.todos.filter(curr => todo.id !== curr.id);
    });
  }

  clearCompleted() {
    this.cancelEdit();

    this.todoService.clearCompleted().subscribe(todos => (this.todos = todos));
  }

  cancelEdit() {
    this.currentTodo = null;
  }

  trackById(index: number, todo: Todo) {
    return todo.id;
  }

  private filterFromString(todoFilter: string) {
    switch (todoFilter) {
      case 'completed':
        return Filter.COMPLETED;
      case 'active':
        return Filter.ACTIVE;
      default:
        return Filter.ALL;
    }
  }

  private filterTodo(todo: Todo) {
    switch (this.todoFilter) {
      case Filter.ACTIVE:
        return !todo.completed;
      case Filter.COMPLETED:
        return todo.completed;
      default:
        return true;
    }
  }
}
