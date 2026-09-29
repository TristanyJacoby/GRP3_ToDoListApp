import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, Priority, Task } from './models/task.model';
import { TaskStorageService } from './services/task-storage.service';

type Filter = 'all' | 'active' | 'completed';
type Sort = 'newest' | 'due' | 'priority';
type DueTone = 'overdue' | 'today' | 'soon' | 'normal' | 'done';

const PRIORITY_RANK: Record<Priority | '', number> = { high: 3, medium: 2, low: 1, '': 0 };
const MS_PER_DAY = 86_400_000;

@Component({
  selector: 'app-root',
  imports: [FormsModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly store = inject(TaskStorageService);

  readonly categories: { value: Category; label: string }[] = [
    { value: 'work', label: 'Work' },
    { value: 'school', label: 'School' },
    { value: 'personal', label: 'Personal' },
  ];
  readonly priorities: { value: Priority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];
  readonly suggestions = [
    'Study for exam',
    'Finish homework',
    'Buy groceries',
    'Exercise for 30 minutes',
  ];
  readonly confettiPieces = Array.from({ length: 12 }, (_, i) => i);

  readonly today = new Date();
  readonly greeting =
    this.today.getHours() < 12
      ? 'Good morning'
      : this.today.getHours() < 18
        ? 'Good afternoon'
        : 'Good evening';

  readonly filter = signal<Filter>('all');
  readonly categoryFilter = signal<Category | ''>('');
  readonly query = signal('');
  readonly sort = signal<Sort>('newest');
  readonly editingId = signal<string | null>(null);
  readonly pendingDelete = signal<Task | null>(null);

  readonly newTitle = signal('');
  readonly newDescription = signal('');
  readonly newCategory = signal<Category | ''>('');
  readonly newPriority = signal<Priority | ''>('');
  readonly newDueDate = signal('');
  readonly composerOpen = signal(false);
  readonly editTitle = signal('');
  readonly editDescription = signal('');
  readonly editCategory = signal<Category | ''>('');
  readonly editPriority = signal<Priority | ''>('');
  readonly editDueDate = signal('');

  readonly tasks = this.store.tasks;

  readonly filteredTasks = computed(() => {
    const filter = this.filter();
    const category = this.categoryFilter();
    const query = this.query().trim().toLowerCase();
    const list = this.tasks().filter(
      (t) =>
        (filter === 'all' || (filter === 'completed') === t.completed) &&
        (!category || t.category === category) &&
        (!query ||
          t.title.toLowerCase().includes(query) ||
          (t.description ?? '').toLowerCase().includes(query)),
    );

    switch (this.sort()) {
      case 'due':
        return [...list].sort((a, b) =>
          a.dueDate && b.dueDate
            ? a.dueDate.localeCompare(b.dueDate)
            : a.dueDate
              ? -1
              : b.dueDate
                ? 1
                : 0,
        );
      case 'priority':
        return [...list].sort(
          (a, b) => PRIORITY_RANK[b.priority ?? ''] - PRIORITY_RANK[a.priority ?? ''],
        );
      default:
        return list;
    }
  });

  readonly hasActiveFilters = computed(() => !!this.query().trim() || !!this.categoryFilter());

  readonly remainingCount = computed(() => this.tasks().filter((t) => !t.completed).length);
  readonly totalCount = computed(() => this.tasks().length);
  readonly completedCount = computed(() => this.totalCount() - this.remainingCount());
  readonly allDone = computed(() => this.totalCount() > 0 && this.remainingCount() === 0);
  readonly progress = computed(() =>
    this.totalCount() === 0 ? 0 : Math.round((this.completedCount() / this.totalCount()) * 100),
  );

  setFilter(filter: Filter): void {
    this.filter.set(filter);
  }

  setCategoryFilter(category: Category | ''): void {
    this.categoryFilter.set(this.categoryFilter() === category ? '' : category);
  }

  clearFilters(): void {
    this.query.set('');
    this.categoryFilter.set('');
  }

  addTask(): void {
    const title = this.newTitle().trim();
    if (!title) return;
    this.store.add({
      title,
      description: this.newDescription(),
      category: this.newCategory(),
      priority: this.newPriority(),
      dueDate: this.newDueDate() || null,
    });
    this.newTitle.set('');
    this.newDescription.set('');
    this.newCategory.set('');
    this.newPriority.set('');
    this.newDueDate.set('');
    this.composerOpen.set(false);
  }

  openComposer(title = ''): void {
    if (title) this.newTitle.set(title);
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
    this.editCategory.set(task.category ?? '');
    this.editPriority.set(task.priority ?? '');
    this.editDueDate.set(task.dueDate ?? '');
  }

  saveEdit(id: string): void {
    const title = this.editTitle().trim();
    if (!title) return;
    this.store.edit(id, {
      title,
      description: this.editDescription(),
      category: this.editCategory(),
      priority: this.editPriority(),
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
    return !!task.dueDate && !task.completed && this.daysUntil(task.dueDate) < 0;
  }

  dueInfo(task: Task): { text: string; tone: DueTone } | null {
    if (!task.dueDate) return null;
    const days = this.daysUntil(task.dueDate);
    const date = this.formatDate(task.dueDate);
    if (task.completed) return { text: date, tone: 'done' };
    if (days < 0) {
      const ago = -days;
      return { text: `Overdue by ${ago} day${ago === 1 ? '' : 's'}`, tone: 'overdue' };
    }
    if (days === 0) return { text: 'Today', tone: 'today' };
    if (days === 1) return { text: 'Tomorrow', tone: 'soon' };
    if (days <= 7) return { text: `In ${days} days`, tone: 'soon' };
    return { text: date, tone: 'normal' };
  }

  categoryLabel(value: Category): string {
    return this.categories.find((c) => c.value === value)?.label ?? value;
  }

  priorityLabel(value: Priority): string {
    return this.priorities.find((p) => p.value === value)?.label ?? value;
  }

  private daysUntil(dueDate: string): number {
    const [year, month, day] = dueDate.split('-').map(Number);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((new Date(year, month - 1, day).getTime() - today.getTime()) / MS_PER_DAY);
  }

  private formatDate(dueDate: string): string {
    const [year, month, day] = dueDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}
