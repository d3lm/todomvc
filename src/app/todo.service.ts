import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Todo } from '../models/todo';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  constructor(private http: HttpClient) {}

  getTodos() {
    return this.http.get<Array<Todo>>(`${environment.apiEndpoint}/api/todos`);
  }

  createTodo(todo: string) {
    return this.http.post<Todo>(`${environment.apiEndpoint}/api/todos`, { title: todo, completed: false });
  }

  updateTodo(todo: Todo) {
    return this.http.put<Todo>(`${environment.apiEndpoint}/api/todos/${todo.id}`, todo);
  }

  deleteTodo(id: number) {
    return this.http.delete<Todo>(`${environment.apiEndpoint}/api/todos/${id}`);
  }

  toggleAll(value: boolean) {
    return this.http.put<Array<Todo>>(`${environment.apiEndpoint}/api/toggleAll?completed=${value}`, null);
  }

  clearCompleted() {
    return this.http.put<Array<Todo>>(`${environment.apiEndpoint}/api/clearCompleted`, null);
  }
}
