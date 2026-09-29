import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from './models/task.model';
import { TaskStorageService } from './services/task-storage.service';

type Filter = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-root',
  imports: [FormsModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly store = inject(TaskStorageService);

  readonly filter = signal<Filter>('all');
  readonly editingId = signal<string | null>(null);

  readonly newTitle = signal('');
  readonly newDueDate = signal('');
  readonly editTitle = signal('');
  readonly editDueDate = signal('');

  readonly tasks = this.store.tasks;

  readonly filteredTasks = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();
    if (filter === 'active') return tasks.filter((t) => !t.completed);
    if (filter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  });

  readonly remainingCount = computed(() => this.tasks().filter((t) => !t.completed).length);
  readonly totalCount = computed(() => this.tasks().length);
  readonly nextIndex = computed(() => String(this.totalCount() + 1).padStart(2, '0'));

  setFilter(filter: Filter): void {
    this.filter.set(filter);
  }

  addTask(): void {
    const title = this.newTitle().trim();
    if (!title) return;
    this.store.add({ title, dueDate: this.newDueDate() || null });
    this.newTitle.set('');
    this.newDueDate.set('');
  }

  startEdit(task: Task): void {
    this.editingId.set(task.id);
    this.editTitle.set(task.title);
    this.editDueDate.set(task.dueDate ?? '');
  }

  saveEdit(id: string): void {
    const title = this.editTitle().trim();
    if (!title) return;
    this.store.edit(id, { title, dueDate: this.editDueDate() || null });
    this.editingId.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  toggleCompleted(id: string): void {
    this.store.toggleCompleted(id);
  }

  removeTask(id: string): void {
    this.store.remove(id);
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
  }
}
