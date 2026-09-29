# Tasks — Field Log

A single-page To-Do List app built with Angular (standalone components, signals). Tasks persist in the browser's `localStorage`, so the list survives a page refresh.

## Features

- View all tasks, with filters for All / Open / Done
- Add a task with a title and optional due date
- Edit a task's title and due date inline
- Mark a task complete/incomplete
- Delete a task
- Overdue tasks (past due date, not completed) are flagged
- Data persists across page refreshes via `localStorage`

## Development server

```bash
npm install
ng serve
```

Then open `http://localhost:4200/`.

## Building

```bash
ng build
```

Build artifacts are written to `dist/`.

## Running unit tests

```bash
ng test
```

## Project structure

- `src/app/models/task.model.ts` — `Task` type
- `src/app/services/task-storage.service.ts` — localStorage-backed task store (signals)
- `src/app/app.ts` / `app.html` / `app.scss` — the single-page UI
