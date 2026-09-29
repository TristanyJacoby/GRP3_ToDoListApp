# To-Do List App

A simple, mobile-friendly to-do list built with Angular. Tasks are saved in your browser's localStorage, so there is no backend.

## Features

- Add tasks with a title, an optional description and an optional due date (floating **+** button)
- Edit a task by tapping its title
- Mark tasks done, and filter by All, To do or Done
- Overdue tasks are highlighted
- Progress ring showing total, completed and remaining tasks
- Confirmation before deleting a task, and a "Clear done" button
- Responsive light theme with accessible colors and 44px touch targets

## Getting started

```bash
npm install
ng serve
```

Then open http://localhost:4200.

Other commands:

```bash
ng build              # production build into dist/
ng test               # run unit tests
```

## Data storage

Tasks are stored in `localStorage` under the key `todo-app.tasks`. They stay in that browser on that device, and clearing site data removes them.

## Project structure

- `src/app/app.*` - main component (template, styles, logic)
- `src/app/services/task-storage.service.ts` - task state and localStorage persistence
- `src/app/models/task.model.ts` - task type
