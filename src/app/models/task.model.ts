export type Category = 'work' | 'school' | 'personal';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: Category | '';
  priority?: Priority | '';
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export type TaskDraft = Pick<Task, 'title' | 'description' | 'category' | 'priority' | 'dueDate'>;
