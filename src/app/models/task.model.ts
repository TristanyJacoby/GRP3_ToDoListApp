export interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export type TaskDraft = Pick<Task, 'title' | 'dueDate'>;
