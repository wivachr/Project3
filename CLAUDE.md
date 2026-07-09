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
- Database: `project3` — a full copy of Project2's `projectinformationsystem` schema+data, split off 2026-07 so the two apps no longer share live data (edits in one no longer reflect in the other)
- Host: `localhost`, User: `root`, Password: (empty)
- Config: `backend/.env` and `backend/src/config/database.js`
- Reference schema: `c:/xampp/htdocs/Project2/projectinformationsystem.sql` (structurally identical to `project3`, but data has diverged since the split)
- Pool has `dateStrings: true` — mysql2 returns DATE/DATETIME columns as strings (`"2569-06-25"`) instead of JS Date objects; without this, dates serialize to UTC ISO strings and shift by the UTC+7 offset (e.g. `2569-06-25` → `"2569-06-24T17:00:00.000Z"`)

### MyISAM tables without AUTO_INCREMENT

Several tables use MyISAM engine with a manually managed PK (no `AUTO_INCREMENT`). Before INSERT, query `SELECT COALESCE(MAX(id_x), 0) AS maxId FROM table` and use `maxId + 1`. Affected tables include:

| Table | PK column | Notes |
|---|---|---|
| `news` | `id_news` | Also requires `id_user` (NOT NULL); date must be BE year computed with UTC+7 |
| `manipulator` | `id_manipulator` | Links students to projects |

### MyISAM crash risk

`title` and `academictitle` tables have crashed before after abrupt shutdown. **REPAIR TABLE** removes corrupted rows (data loss). To restore:
- **Do NOT use `mysql.exe` CLI** — PowerShell encoding corrupts Thai text to `???`
- **Use Node.js** with the mysql2 pool to INSERT Thai strings (charset handled correctly)

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
| `project` | `id_project` | 2-digit BE year + 4-digit seq (e.g. 683004); students link via `manipulator` |
| `manipulator` | `id_manipulator` | `id_student` + `id_project` + `tel_manipulator` |
| `committee` | `id_committee` | positions: ที่ปรึกษา / ประธาน / กรรมการ |
| `coadvisor` | `id_coadvisor` | External advisors (not in teacher table); has `id_title`, `name_coadvisor`, `sname_coadvisor` |
| `exam` | `id_exam` | Per submission; `id_typeexam` **1=หัวข้อ, 2=สอบร้อยเปอร์เซนต์(100%), 3=สอบหกสิบเปอร์เซนต์(60%)** — verified against the live `typeexam` table; a prior version of this doc had 2/3 swapped, which caused a real bug across submit/approve/assign/result routes and several frontend pages (fixed 2026-07). `exam.id_statusproject` uses a separate phase-tracking sub-range distinct from `project.id_statusproject`: 20=submitted/pending, 21=approved/awaiting exam, 22=fail, 23=100%-exam soft fail (resubmit), 24=pass, 25=100%-exam hard fail (F). See `backend/src/config/examStatus.js` for the authoritative per-type status transition tables. |
| `assignexam` | `id_assignexam` | One-to-one with `exam`; stores date/time/room |
| `registration` | composite | `year+semester+id_student+id_subject+section` |
| `race` | `id_race` | `id_project`, `location_race`, `status_race` |
| `headofdepartment` | — | Single row, only column: `id_teacher int(3)` |
| `teacherfreetime` | — | `day_freetime varchar(1)` (1–5 = จ–ศ), `time_freetime varchar(2)` (1–12 = คาบ), `id_teacher` |
| `academicyear` | — | Single row: `year`, `semester` (current academic period) |

Student login accounts (username like `532006`) are **group accounts** — not individual student IDs (13-digit). Real student records live in the `student` table.

## Project status workflow

| id | name | Notes |
|---|---|---|
| 1 | รอการยื่นสอบหัวข้อ | Initial state after registration |
| 2 | ยื่นสอบหัวข้อแล้ว | Student submitted title exam request |
| 3 | ยื่นเรื่องสอบหัวข้อแล้ว | Officer approved title exam |
| 4 | แต่งตั้งกรรมการแล้ว | Committee assigned |
| 5 | จัดวันสอบหัวข้อแล้ว | Exam date set |
| 6 | จัดส่งทก.01หลังการสอบหัวข้อเรียบร้อยแล้ว | Officer confirmed ทก.01 receipt |
| 7–10 | (60% exam flow) | 7=ยื่น, 8=ยื่นเรื่อง, 9=จัดวัน, 10=ผ่าน |
| 11–14 | (100% exam flow) | 11=ยื่น, 12=ยื่นเรื่อง, 13=จัดวัน, 14=ผ่าน |
| 15 | สอบหัวข้อผ่านแล้ว | Title exam passed → await ทก.01 |
| 16 | โครงงานพิเศษเสร็จสิ้นสมบูรณ์ | Book confirmed received |
| 17 | ไม่ผ่าน | Failed (status ≥ 6 at cancel) |
| 18 | ถูกยกเลิก | Cancelled (status < 6 at cancel) |

**Cancel logic:** status < 6 → 18 (ถูกยกเลิก), status ≥ 6 → 17 (ไม่ผ่าน); also sets `user.status_user = 0`

## Name display conventions

- **Teacher names:** `name_academictitle` + `name_teacher` + `sname_teacher` — **omit `name_title`** (นาย/นาง/นางสาว is for students, not teachers)
- **Student names:** `name_title` + `name_student` + `sname_student`
- **Co-advisor names:** `name_title` + `name_coadvisor` + `sname_coadvisor`

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
    ├── admin/           — Dashboard, StudentList, TeacherList, UserList,
    │                      HeadOfDepartment, BasicData
    ├── officer/         — Dashboard, ProjectList, ExamList, NewsList,
    │                      RegisterList, PendingExam, AssignCommittee,
    │                      SaveResult, SubmitBook, TorgorList,
    │                      RaceList, AcademicYear,
    │                      ExamTableReport, ResultReport, StatusReport,
    │                      NoProjectReport, NoExamReport, FallProjectReport,
    │                      PrintExamForm, EvaluationForm,
    │                      CaseStudyReport, ExpiredProjectReport,
    │                      TeacherFreeTimeList
    ├── teacher/         — Dashboard, MyProjects, TeacherProjectList,
    │                      TeacherExams, TeacherFreeTime,
    │                      TeacherStatusReport, TeacherProfile
    ├── student/         — Dashboard, ProjectView, SubmitExam, ExamHistory,
    │                      EditHistory, UploadBook, StudentProfile,
    │                      RegisterProject (public — no auth)
    └── shared/          — ChangePassword
```

## Backend routes

### Auth
| Route | Auth | Description |
|---|---|---|
| `POST /api/auth/login` | public | MD5 password → JWT |
| `GET /api/auth/me` | any | current user from JWT |
| `POST /api/auth/change-password` | any | change own password |

### Students
| Route | Auth | Description |
|---|---|---|
| `GET /api/students` | [1,2] | paginated list with title/faculty/department |
| `GET /api/students/me` | [4] | student's own record (joins via username) |
| `GET /api/students/check/:id` | public | check student exists (for registration form) |
| `GET /api/students/:id` | [1,2,4] | single student |
| `POST /api/students/import` | [1,2] | CSV bulk import |
| `POST /api/students` | [1,2] | add single student |
| `PUT /api/students/:id` | [1,2] | edit student |
| `DELETE /api/students/:id` | [1,2] | delete student |

### Teachers
| Route | Auth | Description |
|---|---|---|
| `GET /api/teachers` | [1,2,3] | paginated list |
| `GET /api/teachers/me` | [3] | teacher's own profile |
| `GET /api/teachers/freetime` | [3] | teacher's own freetime slots |
| `PUT /api/teachers/freetime` | [3] | replace all own freetime slots |
| `GET /api/teachers/freetime-all` | [1,2] | all teachers with freetime slots |
| `GET /api/teachers/:id` | [1,2,3] | single teacher |
| `POST /api/teachers` | [1,2] | add teacher |
| `PUT /api/teachers/:id` | [1,2,3] | edit teacher |
| `DELETE /api/teachers/:id` | [1,2] | delete teacher |

### Projects
| Route | Auth | Description |
|---|---|---|
| `GET /api/projects` | [1,2,3] | paginated list (includes advisors, members via GROUP_CONCAT) |
| `GET /api/projects/teacher` | [3] | teacher's advisory projects |
| `GET /api/projects/my` | [4] | student's own project |
| `GET /api/projects/my/history` | [4] | student's edit history |
| `GET /api/projects/book-list` | [1,2] | projects at status 14 awaiting book submission |
| `GET /api/projects/:id` | [1,2,3,4] | single project with committee, members, exams |
| `POST /api/projects/register` | public | register new project (creates user + project + manipulator) |
| `POST /api/projects` | [4] | student creates project (id_project = username) |
| `PUT /api/projects/:id` | [1,2,4] | edit project fields |
| `DELETE /api/projects/:id` | [1,2] | delete project + committee + manipulator |
| `POST /api/projects/:id/committee` | [1,2] | add committee member |
| `DELETE /api/projects/:id/committee/:cid` | [1,2] | remove committee member |
| `GET /api/projects/:id/members` | [1,2,4] | get project members |
| `POST /api/projects/:id/members` | [4] | add member to project |
| `DELETE /api/projects/:id/members/:mid` | [1,2,4] | remove member |
| `GET /api/projects/:id/coadvisors` | [1,2,3,4] | get co-advisors |
| `POST /api/projects/:id/coadvisors` | [4] | add co-advisor |
| `DELETE /api/projects/:id/coadvisors/:cid` | [4] | remove co-advisor |
| `POST /api/projects/:id/submit-exam` | [4] | student submits exam request |
| `POST /api/projects/:id/torgor` | [1,2] | officer confirms ทก.01 → status 6 |
| `POST /api/projects/:id/cancel` | [1,2] | cancel project (status 17 or 18) |
| `POST /api/projects/:id/confirm-book` | [1,2] | confirm book received → status 16 |
| `POST /api/projects/:id/upload` | [4] | upload book PDF (Multer) |

### Exams
| Route | Auth | Description |
|---|---|---|
| `GET /api/exams` | [1,2,3] | paginated list with advisors, members |
| `GET /api/exams/my` | [4] | student's own exam history |
| `GET /api/exams/:id` | [1,2,3] | single exam |
| `POST /api/exams/:id/assign` | [2] | assign date/time/room |
| `POST /api/exams/:id/approve` | [2] | officer approves exam request |
| `POST /api/exams/:id/result` | [2] | save exam result + update project status |

### Registers
| Route | Auth | Description |
|---|---|---|
| `GET /api/registers` | [1,2] | registration list |
| `DELETE /api/registers` | [1,2] | delete by composite key (body) |
| `POST /api/registers/import` | [1,2] | CSV bulk import |

### News
| Route | Auth | Description |
|---|---|---|
| `GET /api/news` | public | news list |
| `POST /api/news` | [1,2] | add news (MAX id+1, BE date) |
| `PUT /api/news/:id` | [1,2] | edit news |
| `DELETE /api/news/:id` | [1,2] | delete news |

### Races
| Route | Auth | Description |
|---|---|---|
| `GET /api/races` | [1,2] | paginated list (joins project name) |
| `POST /api/races` | [1,2] | add race entry |
| `PUT /api/races/:id` | [1,2] | edit race entry |
| `DELETE /api/races/:id` | [1,2] | delete race entry |

### Head of Department
| Route | Auth | Description |
|---|---|---|
| `GET /api/headofdepartment` | [1,2,3] | current head with name |
| `PUT /api/headofdepartment` | [1] | set head of department |

### Reports
| Route | Auth | Description |
|---|---|---|
| `GET /api/reports/no-project` | [1,2] | registered students without a project this year/sem |
| `GET /api/reports/no-exam` | [1,2] | projects from past years not yet completed |
| `GET /api/reports/fall-project?year=&semester=` | [1,2] | projects that failed title exam |
| `GET /api/reports/case-study?year=&semester=` | [1,2] | projects with casestudy_project text |
| `GET /api/reports/expired` | [1,2] | projects running >2 semesters without completion |

### Lookups
| Route | Auth | Description |
|---|---|---|
| `GET /api/lookups/titles` | any | title dropdown (id/label) |
| `GET /api/lookups/academic-titles` | any | academictitle dropdown |
| `GET /api/lookups/faculties` | any | faculty dropdown |
| `GET /api/lookups/departments` | any | department dropdown |
| `GET /api/lookups/divisions` | any | division dropdown |
| `GET /api/lookups/curriculums` | any | curriculum dropdown |
| `GET /api/lookups/subjects` | any | subject dropdown |
| `GET /api/lookups/rooms` | any | room dropdown |
| `GET /api/lookups/type-exams` | any | typeexam dropdown |
| `GET /api/lookups/status-projects` | any | statusproject dropdown |
| `GET /api/lookups/rights` | [1] | rights dropdown |
| `GET /api/lookups/<table>/all` | [1] | full rows for BasicData editor |
| `POST/PUT/DELETE /api/lookups/<table>` | [1] | BasicData CRUD |
| `GET /api/lookups/teachers-public` | public | teacher list for registration form |
| `GET /api/lookups/subjects-public` | public | subject list for registration form |
| `GET /api/lookups/academic-year` | public | current year/semester |
| `PUT /api/lookups/academic-year` | [1,2] | update current year/semester |

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
- **Do not use hardcoded Tailwind color classes** (`bg-blue-*`, `text-blue-*`, `border-blue-*`) — use shadcn CSS variable tokens (`bg-primary`, `text-primary`, `ring-primary`, etc.) so the theme is driven by `index.css` variables
- Print support: `@media print` in `index.css` — use `.print:hidden` to hide UI elements when printing

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
- `title` table: 24 rows (id 0–23); id 0 = ว่าง, id 1 = นาย, id 2 = นาง, id 3 = นางสาว
- `academictitle` table: 7 rows (id 1–7); 1=อาจารย์, 2=อาจารย์ ดร., 3=ผศ., 4=ผศ.ดร., 5=ว่าที่ร้อยตรี, 6=รศ., 7=รศ.ดร.

## Playwright (screenshots / testing)

Playwright is installed globally. Use dynamic import to avoid ESM path issues on Windows:
```js
const { chromium } = await import(
  new URL('file:///C:/Users/wivac/AppData/Roaming/npm/node_modules/playwright/index.mjs').href
);
```

Or write a `.mjs` file and run with `node file.mjs`.

The Vite dev server binds to `[::1]` (IPv6) by default — use `--host 127.0.0.1` to bind to IPv4 for Playwright tests.
