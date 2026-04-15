# TalentFlow — Frontend (Instructor & Admin Console)

This repository contains the frontend for TalentFlow's Instructor and Admin console — the interfaces instructors and administrators use to create courses, manage learners, grade work, and monitor platform activity.

This README focuses on what the app does and how to run and extend it.

## What this app is

- A role-based admin and instructor UI for TalentFlow.
- Lets instructors create and manage courses, view learner progress, grade submissions, and communicate with learners.
- Lets admins manage users, courses, notifications, teams, and view platform analytics.
- Designed to integrate with the shared UI library (tables, forms, modals) and the backend services for auth, courses, and reporting.

## Key featuresCREATE DATABASE talent_flow;
CREATE USER 'talent_flow'@'localhost' IDENTIFIED BY 'talent_flow_password';
GRANT ALL PRIVILEGES ON talent_flow.* TO 'talent_flow'@'localhost';

- Course authoring and publishing
- Grading and submission workflows
- Learner roster and team allocation
- Notifications and announcements
- Role-based navigation and guards (Instructor / Admin)
- Responsive UI with Tailwind CSS

## Quick start (developer)

1. Install dependencies

```bash
cd frontend
npm install
```

2. Start dev server (Vite)

```bash
npm run dev
```

Open http://localhost:5173 (or the port printed by Vite).

3. Build for production

```bash
npm run build
```

## App structure (summary)

- `src/app/` — role-based routes and pages (instructor, admin, public)
- `src/modules/` — domain logic and API services by feature (courses, users, notifications)
- `src/shared/` — shared UI, layouts, state (auth store), and utilities
- `index.html`, `main.tsx`, `App.tsx` — application entry and router

Designs and reference assets live in `/HIGH_FI` and `/Designs`.

## How to extend

- Add domain services under `src/modules/{domain}/services` and corresponding hooks in `src/modules/{domain}/hooks`.
- Use `useAuthStore` (in `src/shared/state/auth`) for auth state and `ProtectedRoute`/`InstructorRoute`/`AdminRoute` for guards.
- Add pages under `src/app/{role}/...` and wire routes in `App.tsx`.

## Working with assets

- Place static images in `public/images/` and reference them with `/images/<name>` from components.

## Contributing

- Create feature branches prefixed with `feat/` and open PRs against `frontend-integration`.
- Run lint and tests before submitting: `npm run lint && npm run test`.

---

For questions or to coordinate shared component changes, check the design files and reach out in the project channel.

Happy building! 🚀
