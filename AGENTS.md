# Repository Guidelines

## Project Structure & Module Organization

Project3 is a React/Node rewrite of the older XAMPP/PHP system. The app is split into:

- `frontend/`: React 19 + Vite UI. Main routes live in `frontend/src/App.jsx`; role-specific pages are under `frontend/src/pages/{admin,officer,teacher,student,shared}`.
- `frontend/src/components/`: shared layout, tables, protected routing, and shadcn-style UI primitives in `components/ui/`.
- `frontend/src/services/api.js`: Axios API client targeting the backend.
- `backend/`: Express 5 API. Entry point is `backend/src/server.js`; routes are in `backend/src/routes/`; auth and errors are in `backend/src/middleware/`; MySQL config is in `backend/src/config/database.js`.
- `backend/uploads/`: runtime PDF uploads and migrated Project2 files. Contents are ignored except `.gitkeep`.

## Build, Test, and Development Commands

Run dependency installation separately in each app:

```powershell
cd backend; npm install
cd ../frontend; npm install
```

Backend commands:

- `npm run dev`: start Express with Node watch mode on port `5000`.
- `npm start`: start the backend normally.

Frontend commands:

- `npm run dev`: start Vite on `http://localhost:5173`.
- `npm run build`: create the production build in `frontend/dist/`.
- `npm run lint`: run `oxlint`.
- `npm run preview`: preview the built frontend.

Keep Vite on port `5173` unless you also update CORS in `backend/src/server.js`.

## Coding Style & Naming Conventions

Use JavaScript/JSX with 2-space indentation, semicolons, and single quotes, matching existing files. React components use PascalCase (`TeacherStatusReport.jsx`); route modules and helpers use lower camelCase or plural nouns (`students.js`, `api.js`). Prefer existing shared components before creating new ones. Use the `@` alias for frontend `src` imports where practical. For Thai/Buddhist Era dates, use `fmtDate()` and `ThaiDatePicker`; do not use `toLocaleDateString('th-TH')` on database dates.

## Testing Guidelines

No automated test framework is currently configured. Before submitting, run `npm run lint` and `npm run build` in `frontend/`, then manually smoke-test login and changed role workflows against local MySQL. For backend changes, start `npm run dev` and test affected `/api/*` routes with real JWT/auth behavior.

## Commit & Pull Request Guidelines

History uses imperative, sentence-case commits such as `Refactor news post route...` and `Add README.md...`. Keep commits focused. Pull requests should include a short summary, affected roles/pages or API routes, database or `.env` implications, manual test steps, and screenshots for visible UI changes.

## Security & Configuration Tips

Keep `backend/.env` untracked. The local database is `projectinformationsystem` in XAMPP MySQL; do not commit secrets, uploads, or generated build output.
