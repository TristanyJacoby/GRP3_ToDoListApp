import { Component, HostListener, computed, inject, signal } from '@angular/core';
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
  readonly pendingDelete = signal<Task | null>(null);

  readonly newTitle = signal('');
  readonly newDescription = signal('');
  readonly newDueDate = signal('');
  readonly composerOpen = signal(false);
  readonly editTitle = signal('');
  readonly editDescription = signal('');
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
  readonly completedCount = computed(() => this.totalCount() - this.remainingCount());
  readonly progress = computed(() =>
    this.totalCount() === 0 ? 0 : Math.round((this.completedCount() / this.totalCount()) * 100),
  );

  setFilter(filter: Filter): void {
    this.filter.set(filter);
  }

  addTask(): void {
    const title = this.newTitle().trim();
    if (!title) return;
    this.store.add({
      title,
      description: this.newDescription(),
      dueDate: this.newDueDate() || null,
    });
    this.newTitle.set('');
    this.newDescription.set('');
    this.newDueDate.set('');
    this.composerOpen.set(false);
  }

  openComposer(): void {
    this.composerOpen.set(true);
    setTimeout(() => document.querySelector<HTMLElement>('.sheet__title')?.focus());
  }

  closeComposer(): void {
    this.composerOpen.set(false);
  }

  startEdit(task: Task): void {
    this.editingId.set(task.id);
    this.editTitle.set(task.title);
    this.editDescription.set(task.description ?? '');
    this.editDueDate.set(task.dueDate ?? '');
  }

  saveEdit(id: string): void {
    const title = this.editTitle().trim();
    if (!title) return;
    this.store.edit(id, {
      title,
      description: this.editDescription(),
      dueDate: this.editDueDate() || null,
    });
    this.editingId.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  toggleCompleted(id: string): void {
    this.store.toggleCompleted(id);
  }

  clearCompleted(): void {
    this.store.clearCompleted();
    if (this.filter() === 'completed') this.filter.set('all');
  }

  askDelete(task: Task): void {
    this.pendingDelete.set(task);
    setTimeout(() => document.querySelector<HTMLElement>('.dialog__cancel')?.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.pendingDelete()) this.cancelDelete();
    else this.closeComposer();
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  confirmDelete(): void {
    const task = this.pendingDelete();
    if (task) this.store.remove(task.id);
    this.pendingDelete.set(null);
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
  }
}
