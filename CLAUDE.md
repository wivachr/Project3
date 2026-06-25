# Project3 — ระบบสารสนเทศโครงการพิเศษ

React/Node rewrite of the PHP system at `c:/xampp/htdocs/Project2/`.

## Architecture

```
Project3/
├── frontend/   React 19 + Vite 8 + Tailwind v4
└── backend/    Node.js + Express 5 + MySQL2
```

## Dev servers

```bash
# Backend (port 5000) — run from backend/
node src/server.js

# Frontend (port 5173) — run from frontend/
npx vite
```

CORS is locked to `http://localhost:5173`. If Vite picks a different port, update `backend/src/server.js`.

## Database

- Engine: MySQL via XAMPP
- Database: `projectinformationsystem`
- Host: `localhost`, User: `root`, Password: (empty)
- Config: `backend/.env` and `backend/src/config/database.js`
- Reference schema: `c:/xampp/htdocs/Project2/projectinformationsystem.sql`

## Auth / JWT

- Login: MD5 password → JWT signed with `JWT_SECRET`
- JWT payload: `{ iduser, username, fullname, right, idproject }`
- Rights: `1`=admin, `2`=officer, `3`=teacher, `4`=student
- Token stored in `localStorage`; sent as `Authorization: Bearer <token>`
- Middleware: `backend/src/middleware/auth.js` — `auth([1,2])` restricts by right

**Note:** `user.fullname` is computed as `CONCAT(name_user, ' ', sname_user)` in auth.js — the `user` table has no `fullname` column.

## Key DB relationships

| Table | PK | Notes |
|---|---|---|
| `user` | `id_user` | `id_right` → `right.id_right`; `username` = login name |
| `student` | `id_student` (varchar 13) | No `id_user` column; student username ≠ id_student |
| `teacher` | `id_teacher` | Has `id_user` linking to user table |
| `project` | `id_project` | Students link via `manipulator` table |
| `committee` | `id_committee` | positions: ที่ปรึกษา/ประธาน/กรรมการ |
| `exam` | `id_exam` | Per submission; results stored in `result` (1=pass, 0=fail) |
| `assignexam` | `id_assignexam` | One-to-one with `exam`; stores date/time/room |
| `registration` | composite | `year+semester+id_student+id_subject+section` |

Student login accounts (username like `532006`) are **group accounts** — not individual student IDs (13-digit). Real student records live in the `student` table.

## Frontend structure

```
frontend/src/
├── App.jsx              — all routes
├── contexts/AuthContext.jsx
├── services/api.js      — axios instance (baseURL: http://localhost:5000/api)
├── components/
│   ├── Layout.jsx       — sidebar + topbar
│   ├── ProtectedRoute.jsx
│   └── Table.jsx        — exports Table, Pagination, SearchBar
└── pages/
    ├── Login.jsx
    ├── admin/           — Dashboard, StudentList, TeacherList, UserList
    ├── officer/         — Dashboard, ProjectList, ExamList, NewsList,
    │                      RegisterList, PendingExam, AssignCommittee,
    │                      SaveResult, SubmitBook, ExamTableReport, ResultReport,
    │                      StatusReport, AcademicYear
    ├── teacher/         — Dashboard, MyProjects, TeacherProjectList,
    │                      TeacherExams, TeacherStatusReport, TeacherProfile
    ├── student/         — Dashboard, ProjectView, SubmitExam, ExamHistory,
    │                      UploadBook, StudentProfile
    └── shared/          — ChangePassword
```

## Backend routes

| Route | Auth | Description |
|---|---|---|
| `POST /api/auth/login` | public | MD5 password |
| `GET /api/auth/me` | any | current user from JWT |
| `POST /api/auth/change-password` | any | change own password |
| `GET /api/students` | [1,2] | paginated list |
| `GET /api/students/me` | [4] | student's own record (joins via username) |
| `GET /api/teachers` | [1,2,3] | paginated list |
| `GET /api/teachers/me` | [3] | teacher's own record (by id_user) |
| `GET /api/projects` | [1,2,3] | all projects paginated |
| `GET /api/projects/teacher` | [3] | teacher's advisory projects |
| `GET /api/projects/my` | [4] | student's own project |
| `POST /api/projects/:id/committee` | [1,2] | add committee member |
| `DELETE /api/projects/:id/committee/:cid` | [1,2] | remove committee member |
| `POST /api/projects/:id/submit-exam` | [4] | student submits exam request |
| `GET /api/projects/book-list` | [1,2] | projects with status 14 awaiting book submission |
| `POST /api/projects/:id/confirm-book` | [1,2] | confirm book received → status 16 |
| `POST /api/projects/:id/upload` | [4] | upload book file (PDF) |
| `GET /api/exams` | [1,2,3] | all exams paginated |
| `GET /api/exams/my` | [4] | student's own exam history |
| `POST /api/exams/:id/assign` | [2] | assign date/room |
| `POST /api/exams/:id/approve` | [2] | officer approves exam request |
| `POST /api/exams/:id/result` | [2] | save exam result |
| `GET /api/registers` | [1,2] | registration list |
| `DELETE /api/registers` | [1,2] | delete by composite key (body) |
| `GET /api/news` | public | news list |
| `GET/POST/PUT/DELETE /api/news` | [1,2] | manage news |
| `GET /api/lookups/*` | varies | lookup tables |
| `GET/PUT /api/lookups/academic-year` | [1,2] | current year/semester |

## Page patterns

All list pages follow this pattern:
```jsx
const [data, setData] = useState([]);
const [total, setTotal] = useState(0);
const [page, setPage] = useState(1);
// load() → api.get(..., { params: { page, limit: 20, key } })
// <Table columns={...} data={data} loading={loading} />
// <Pagination page={page} total={total} limit={20} onPage={...} />
// <SearchBar value={key} onChange={setKey} onSearch={handleSearch} />
```

Dashboard sidebars are defined in each `Dashboard.jsx` as a `MENU` constant — no separate nav config file.

## Test accounts

| Username | Password | Role |
|---|---|---|
| `laddagob` | `gobdda` | Officer (right=2) |
| `SLJ` | `1234` | Teacher (right=3) |
| `532006` | `1234` | Student (right=4) |

Admin accounts: check `user` table WHERE `id_right=1`.

## UI / Styling

- **shadcn/ui** component system: `frontend/src/components/ui/` (button, card, input, label, badge, dialog, select, separator, thai-date-picker)
- **Tailwind v4** with CSS variables (`@theme inline`) and OKLCH color space — see `frontend/src/index.css`
- Path alias `@` → `./src` via `vite.config.js`
- `cn()` helper in `frontend/src/lib/utils.js` (clsx + tailwind-merge)
- `fmtDate(dateStr)` in utils.js — formats `yyyy-mm-dd` to `d/m/yyyy` **without** calling `toLocaleDateString` (DB stores Buddhist Era years; `toLocaleDateString('th-TH')` would double-convert to 3112)
- `ThaiDatePicker` — `<input type="date">` wrapper that converts BE↔CE for the browser (subtract 543 in, add 543 out)
- `frontend/index.html` has `lang="th"` so browser calendar shows Thai month names

## File uploads

Uploaded files go to `backend/uploads/`. The directory is served at two mount points:
- `/uploads/<filename>` — new-style paths stored by Project3 (e.g. `/uploads/1234567890-file.pdf`)
- `/` root — old-style paths from Project2 DB (e.g. `2553-1/531003.pdf`)

PDF files from Project2 (`c:/xampp/htdocs/Project2/<year-semester>/`) were copied into `backend/uploads/<year-semester>/` preserving folder structure. ~1 748 files total. The `uploads/` folder is git-ignored.

## Data quality notes

- `teacher` list sorted `ORDER BY id_teacher DESC` (newest first)
- `student` list sorted `ORDER BY id_student DESC` (newest first)
- 12 empty teacher records (id 32–43, name/surname blank, unreferenced) were deleted — 31 teachers remain
- 69 student records deleted: 55 with malformed IDs + empty names, 14 malformed duplicate IDs not referenced in `manipulator` — 1 959 students remain
- `student` id_student `5506021623106` and `5506021632106` (นักศึกษาชื่อเดียวกัน สะกดต่างกัน) ถูกเก็บไว้ทั้งคู่ เพราะทั้งคู่มีข้อมูลใน `manipulator`

## Playwright (screenshots / testing)

Playwright is installed globally. Use dynamic import to avoid ESM path issues on Windows:
```js
const { chromium } = await import(
  new URL('file:///C:/Users/wivac/AppData/Roaming/npm/node_modules/playwright/index.mjs').href
);
```

Or write a `.mjs` file and run with `node file.mjs`.

The Vite dev server binds to `[::1]` (IPv6) by default — use `--host 127.0.0.1` to bind to IPv4 for Playwright tests.
