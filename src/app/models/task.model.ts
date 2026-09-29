export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export type TaskDraft = Pick<Task, 'title' | 'description' | 'dueDate'>;
