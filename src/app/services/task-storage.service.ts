import { Injectable, signal } from '@angular/core';
import { Task, TaskDraft } from '../models/task.model';

const STORAGE_KEY = 'todo-app.tasks';

@Injectable({ providedIn: 'root' })
export class TaskStorageService {
  private readonly _tasks = signal<Task[]>(this.load());
  readonly tasks = this._tasks.asReadonly();

  add(draft: TaskDraft): void {
    const task: Task = {
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      description: draft.description?.trim() ?? '',
      dueDate: draft.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.update([task, ...this._tasks()]);
  }

  edit(id: string, draft: TaskDraft): void {
    this.update(
      this._tasks().map((task) =>
        task.id === id ? {
                ...task,
                title: draft.title.trim(),
                description: draft.description?.trim() ?? '',
                dueDate: draft.dueDate,
              } : task,
      ),
    );
  }

  toggleCompleted(id: string): void {
    this.update(
      this._tasks().map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  }

  remove(id: string): void {
    this.update(this._tasks().filter((task) => task.id !== id));
  }

  clearCompleted(): void {
    this.update(this._tasks().filter((task) => !task.completed));
  }

  private update(tasks: Task[]): void {
    this._tasks.set(tasks);
    this.persist(tasks);
  }

  private load(): Task[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Task[]) : [];
    } catch {
      return [];
    }
  }

  private persist(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // localStorage unavailable (private mode, quota) — state stays in-memory only
    }
  }
}
