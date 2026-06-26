# ระบบสารสนเทศโครงการพิเศษ (Project3)

ระบบสารสนเทศโครงการพิเศษ สำหรับบริหารจัดการโครงงานนักศึกษา รองรับการสอบหัวข้อ สอบ 60% สอบ 100% และการส่งปริญญานิพนธ์ฉบับสมบูรณ์

---

## การย้ายระบบจาก Project2

Project3 คือการเขียนใหม่ (rewrite) ของระบบ PHP เดิม (`Project2`) ด้วย React + Node.js

| หัวข้อ | Project2 (เดิม) | Project3 (ใหม่) |
|---|---|---|
| Frontend | PHP + HTML inline | React 19 + Vite + Tailwind v4 |
| Backend | PHP + Apache (XAMPP) | Node.js + Express 5 |
| Database | MySQL (XAMPP) | MySQL (XAMPP) — **ฐานข้อมูลเดิม** |
| Auth | Session PHP | JWT (8 ชั่วโมง) |
| UI | Bootstrap/ตาราง HTML | shadcn/ui + Tailwind CSS |
| ไฟล์ PDF | `Project2/<ปี-ภาค>/<รหัส>.pdf` | คัดลอกไปยัง `backend/uploads/<ปี-ภาค>/` |

Project3 เชื่อมต่อฐานข้อมูล `projectinformationsystem` ตัวเดิม ไม่มีการเปลี่ยนแปลง schema — สามารถสลับใช้ทั้งสองระบบได้ในระหว่างการเปลี่ยนผ่าน

---

## ความต้องการของระบบ

- **Node.js** v18 ขึ้นไป
- **XAMPP** (MySQL + Apache) — ใช้เฉพาะ MySQL
- **npm** v9 ขึ้นไป

---

## การติดตั้ง

### 1. โคลน Repository

```bash
git clone https://github.com/wivachr/Project3.git
cd Project3
```

### 2. ตั้งค่า Backend

```bash
cd backend
npm install
```

สร้างไฟล์ `.env` ใน `backend/`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=projectinformationsystem
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=8h
```

### 3. ตั้งค่า Frontend

```bash
cd frontend
npm install
```

### 4. นำเข้าฐานข้อมูล

เปิด **XAMPP** แล้วสตาร์ท MySQL จากนั้น import schema:

```bash
# วิธีที่ 1: ผ่าน phpMyAdmin
# เปิด http://localhost/phpmyadmin → สร้าง database ชื่อ projectinformationsystem → Import SQL

# วิธีที่ 2: ผ่าน command line
mysql -u root projectinformationsystem < c:/xampp/htdocs/Project2/projectinformationsystem.sql
```

### 5. คัดลอกไฟล์ PDF จากระบบเดิม (ถ้ามี Project2)

```bash
python3 migrate_pdfs.py
```

หรือคัดลอกโฟลเดอร์ปี-ภาค (`2553-1/`, `2554-1/`, ...) จาก `Project2/` ไปวางใน `backend/uploads/` โดยตรง

---

## การเริ่มใช้งาน

### รัน Backend (port 5000)

```bash
cd backend
node src/server.js
```

### รัน Frontend (port 5173)

```bash
cd frontend
npx vite
```

เปิดเบราว์เซอร์ที่ `http://localhost:5173`

> **หมายเหตุ:** CORS ถูกล็อกไว้ที่ `http://localhost:5173` หากต้องการเปลี่ยน port ให้แก้ในไฟล์ `backend/src/server.js`

---

## โครงสร้างโปรเจกต์

```
Project3/
├── backend/
│   ├── src/
│   │   ├── config/       database.js
│   │   ├── middleware/   auth.js, errorHandler.js
│   │   ├── routes/       auth, students, teachers, projects,
│   │   │                 exams, news, registers, races,
│   │   │                 headofdepartment, lookups, reports
│   │   └── server.js
│   ├── uploads/          ไฟล์ PDF ที่อัปโหลด
│   └── .env
└── frontend/
    ├── public/           head.jpg, logo.png
    └── src/
        ├── components/
        │   ├── ui/       button, card, input, badge, dialog,
        │   │             select, thai-date-picker, ...
        │   ├── Layout.jsx
        │   └── Table.jsx
        ├── pages/
        │   ├── admin/    Dashboard, StudentList, TeacherList,
        │   │             UserList, HeadOfDepartment, BasicData
        │   ├── officer/  Dashboard, ProjectList, ExamList,
        │   │             NewsList, RegisterList, PendingExam,
        │   │             AssignCommittee, SaveResult, SubmitBook,
        │   │             TorgorList, RaceList, AcademicYear,
        │   │             ExamTableReport, ResultReport, StatusReport,
        │   │             NoProjectReport, NoExamReport, FallProjectReport,
        │   │             PrintExamForm, EvaluationForm,
        │   │             CaseStudyReport, ExpiredProjectReport,
        │   │             TeacherFreeTimeList
        │   ├── teacher/  Dashboard, MyProjects, TeacherProjectList,
        │   │             TeacherExams, TeacherFreeTime,
        │   │             TeacherStatusReport, TeacherProfile
        │   ├── student/  Dashboard, ProjectView, SubmitExam,
        │   │             ExamHistory, EditHistory, UploadBook,
        │   │             StudentProfile, RegisterProject (public)
        │   └── shared/   ChangePassword
        ├── contexts/     AuthContext.jsx
        ├── services/     api.js (axios)
        └── lib/          utils.js (cn, fmtDate)
```

---

## บัญชีทดสอบ

| ชื่อผู้ใช้ | รหัสผ่าน | บทบาท |
|---|---|---|
| *(ดูใน `user` table WHERE `id_right=1`)* | — | Admin |
| `laddagob` | `gobdda` | เจ้าหน้าที่ (Officer) |
| `SLJ` | `1234` | อาจารย์ (Teacher) |
| `532006` | `1234` | นักศึกษา (Student) |

---

## สิทธิ์การใช้งาน

| สิทธิ์ | บทบาท | เข้าถึง |
|---|---|---|
| 1 | Admin | จัดการผู้ใช้ ข้อมูลพื้นฐาน หัวหน้าภาควิชา |
| 2 | เจ้าหน้าที่ | จัดการโครงการ การสอบ รายงาน ข่าว ปีการศึกษา |
| 3 | อาจารย์ | ดูโครงการที่ปรึกษา ตารางสอบ ตารางเวลาว่าง |
| 4 | นักศึกษา | ดูโครงการตัวเอง ส่งคำร้องสอบ อัปโหลด PDF |

---

## ฟีเจอร์หลัก

### Admin
- จัดการนักศึกษา (เพิ่ม/แก้ไข/ลบ/นำเข้า CSV)
- จัดการอาจารย์ (เพิ่ม/แก้ไข/ลบ)
- จัดการผู้ใช้งาน
- ตั้งค่าหัวหน้าภาควิชา
- ข้อมูลพื้นฐาน (คำนำหน้า, ตำแหน่งวิชาการ, คณะ, ภาควิชา, สาขา, หลักสูตร, วิชา, ห้องสอบ, ประเภทการสอบ, สถานะโครงการ, สิทธิ์ผู้ใช้)
- ตั้งค่าปีการศึกษา

### เจ้าหน้าที่
- รายชื่อนักศึกษา / อาจารย์ / ลงทะเบียน
- รายการโครงการ (ค้นหา / กรอง / แก้ไข / ยกเลิก)
- รอสอบหัวข้อ / 60% / 100% (อนุมัติคำร้อง)
- มอบหมายกรรมการ, กำหนดวันสอบ, บันทึกผลสอบ
- จัดการการส่งปริญญานิพนธ์ฉบับสมบูรณ์
- **จัดการการส่ง ทก.01** (รับแบบฟอร์มหลังสอบหัวข้อผ่าน)
- การแข่งขัน (เพิ่ม/แก้ไข/ลบ)
- ตารางเวลาว่างของอาจารย์ทุกคน
- รายงาน:
  - ตารางสอบ / ผลการสอบ / สถานะโครงการ
  - นักศึกษาที่ไม่มีหัวข้อ / โครงการค้างชำระ / สอบหัวข้อไม่ผ่าน
  - **โครงการกรณีศึกษา** (กรองตามปี/ภาค)
  - **โครงการค้างปี** (ค้างมากกว่า 2 ภาคเรียน)
  - พิมพ์ใบยื่นสอบ / **ใบประเมินการสอบ** (3 ประเภท พร้อมเกณฑ์การให้คะแนน)
- ข่าวประกาศ, ตั้งค่าปีการศึกษา

### อาจารย์
- โครงการที่ปรึกษา, ตารางสอบ, รายงานสถานะ
- **บันทึกตารางเวลาว่าง** (คาบ 1–12 วันจันทร์–ศุกร์)
- แก้ไขโปรไฟล์

### นักศึกษา
- **ลงทะเบียนโครงการใหม่** (หน้า public ไม่ต้อง login)
- ข้อมูลโครงการ, สมาชิก, กรรมการ, อาจารย์ที่ปรึกษาร่วม
- ส่งคำร้องสอบหัวข้อ / 60% / 100%
- ประวัติการสอบ, ประวัติการแก้ไขโครงการ
- อัปโหลดเล่มรายงาน PDF

---

## workflow สถานะโครงการ

```
ลงทะเบียน → [1] รอยื่นสอบหัวข้อ
→ [2] ยื่นสอบหัวข้อแล้ว (นักศึกษายื่น)
→ [3] ยื่นเรื่องสอบหัวข้อแล้ว (เจ้าหน้าที่อนุมัติ)
→ [4] แต่งตั้งกรรมการแล้ว
→ [5] จัดวันสอบหัวข้อแล้ว
→ [15] สอบหัวข้อผ่านแล้ว
→ [6] รับ ทก.01 แล้ว ← เจ้าหน้าที่กดรับ
→ [7→8→9→10] สอบ 60% (ยื่น→อนุมัติ→จัดวัน→ผ่าน)
→ [11→12→13→14] สอบ 100% (ยื่น→อนุมัติ→จัดวัน→ผ่าน)
→ [16] โครงงานพิเศษเสร็จสิ้นสมบูรณ์

ยกเลิก: status < 6 → [18] ถูกยกเลิก | status ≥ 6 → [17] ไม่ผ่าน
```

---

## วันที่และปีการศึกษา

ฐานข้อมูลเก็บวันที่เป็น **พุทธศักราช (พ.ศ.)** โดยตรงใน MySQL DATE column (เช่น `2569-06-10`)

- ห้ามใช้ `toLocaleDateString('th-TH')` — จะบวก 543 ซ้ำทำให้ปีกลายเป็น 3112
- ใช้ `fmtDate(dateStr)` จาก `frontend/src/lib/utils.js` แทน
- `ThaiDatePicker` จัดการแปลง พ.ศ. ↔ ค.ศ. สำหรับ `<input type="date">` อัตโนมัติ
- Pool config มี `dateStrings: true` — ป้องกัน mysql2 แปลง DATE เป็น JS Date object แล้ว serialize เป็น UTC ทำให้วันเลื่อน (เช่น `2569-06-25` กลายเป็น `"2569-06-24T17:00:00.000Z"`)
- เมื่อ INSERT วันที่จาก backend ให้คำนวณปี พ.ศ. และใช้ UTC+7: `new Date(Date.now() + 7*3600000)` แล้วอ่านด้วย `getUTCFullYear/Month/Date`

---

## ข้อควรระวัง: MyISAM Crash

ตาราง `title` และ `academictitle` ใช้ engine MyISAM และเคย crash มาแล้ว REPAIR TABLE ทำให้ข้อมูลหาย ให้ restore ด้วย Node.js เท่านั้น:

```js
// ห้ามใช้ mysql.exe CLI — PowerShell encoding เสียหาย ภาษาไทยกลายเป็น "???"
// ให้ใช้ Node.js + mysql2 pool เท่านั้น สำหรับ INSERT ข้อความภาษาไทย
const pool = require('./src/config/database');
await pool.query("INSERT INTO title VALUES (1, 'นาย')");
```

---

## การย้ายระบบไปยัง Ubuntu (Production)

คู่มือนี้สำหรับ Ubuntu 22.04 LTS ขึ้นไป สถาปัตยกรรม: Nginx (reverse proxy) → Node.js backend (port 5000) + React build (static files)

### 1. ติดตั้ง dependencies

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# MySQL Server
sudo apt install -y mysql-server

# Nginx
sudo apt install -y nginx

# PM2 (process manager)
sudo npm install -g pm2
```

### 2. ตั้งค่า MySQL

```bash
sudo mysql_secure_installation   # ตั้ง root password, ลบ anonymous user

sudo mysql -u root -p
```

```sql
CREATE DATABASE projectinformationsystem CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE USER 'project3'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON projectinformationsystem.* TO 'project3'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

นำเข้า schema และข้อมูล (export จาก Windows ก่อนด้วย phpMyAdmin หรือ mysqldump):

```bash
mysql -u project3 -p projectinformationsystem < projectinformationsystem.sql
```

### 3. โคลนและติดตั้งโปรเจกต์

```bash
cd /var/www
sudo git clone https://github.com/wivachr/Project3.git
sudo chown -R $USER:$USER /var/www/Project3
cd Project3

# Backend dependencies
cd backend && npm install --omit=dev && cd ..

# Frontend dependencies + build
cd frontend && npm install && npm run build && cd ..
```

### 4. ตั้งค่า Backend `.env`

```bash
nano /var/www/Project3/backend/.env
```

```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=project3
DB_PASSWORD=yourpassword
DB_NAME=projectinformationsystem
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=8h
```

### 5. คัดลอกไฟล์ PDF

```bash
# จาก Windows ส่งไฟล์ด้วย scp (รันบน Windows)
scp -r "C:\xampp\htdocs\Project2\2553-1" user@server:/var/www/Project3/backend/uploads/
scp -r "C:\xampp\htdocs\Project2\2554-1" user@server:/var/www/Project3/backend/uploads/
# ... ทำซ้ำสำหรับทุกโฟลเดอร์ปี-ภาค

# หรือใช้ rsync (เร็วกว่า ถ้ามีหลายพันไฟล์)
rsync -avz /mnt/c/xampp/htdocs/Project2/ user@server:/var/www/Project3/backend/uploads/ \
  --include="*/" --include="*.pdf" --exclude="*"
```

ตรวจสอบ permission:

```bash
sudo chown -R www-data:www-data /var/www/Project3/backend/uploads
chmod -R 755 /var/www/Project3/backend/uploads
```

### 6. เปิด Backend ด้วย PM2

```bash
cd /var/www/Project3/backend
pm2 start src/server.js --name project3-backend
pm2 save
pm2 startup   # ทำตาม command ที่ PM2 แสดง เพื่อให้ restart อัตโนมัติตอน boot
```

ตรวจสอบ:

```bash
pm2 status
pm2 logs project3-backend
curl http://127.0.0.1:5000/api/news   # ควรได้ JSON
```

### 7. ตั้งค่า Nginx

แก้ไข CORS ใน `backend/src/server.js` ให้ตรงกับ domain จริงก่อน:

```js
// เปลี่ยนจาก
origin: 'http://localhost:5173'
// เป็น
origin: 'https://yourdomain.com'
```

สร้าง Nginx config:

```bash
sudo nano /etc/nginx/sites-available/project3
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;   # หรือ IP ของ server

    # Frontend — serve React build
    root /var/www/Project3/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # SPA fallback
    }

    # Backend API — proxy ไปยัง Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # PDF uploads — proxy ไปยัง Node.js (รองรับทั้ง /uploads/ และ legacy paths)
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000;
    }

    # ไฟล์ PDF legacy path (2553-1/531003.pdf)
    location ~* ^/\d{4}-\d/ {
        proxy_pass http://127.0.0.1:5000;
    }

    client_max_body_size 50M;   # สำหรับ upload PDF
}
```

```bash
sudo ln -s /etc/nginx/sites-available/project3 /etc/nginx/sites-enabled/
sudo nginx -t   # ตรวจ syntax
sudo systemctl reload nginx
```

### 8. HTTPS ด้วย Let's Encrypt (ถ้ามี domain)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Certbot จะแก้ Nginx config ให้อัตโนมัติ และต่ออายุ certificate ทุก 90 วันเอง

### 9. อัปเดตระบบในอนาคต

```bash
cd /var/www/Project3
git pull

# ถ้ามีการเปลี่ยน frontend
cd frontend && npm install && npm run build && cd ..

# ถ้ามีการเปลี่ยน backend
cd backend && npm install --omit=dev && cd ..
pm2 restart project3-backend
```

### ตรวจสอบปัญหาที่พบบ่อย

| ปัญหา | สาเหตุ | แก้ไข |
|---|---|---|
| 502 Bad Gateway | PM2/backend ไม่ทำงาน | `pm2 status`, `pm2 logs project3-backend` |
| PDF ไม่แสดง | Permission หรือ path ผิด | `ls /var/www/Project3/backend/uploads/`, ตรวจ Nginx location |
| Login ไม่ได้ | DB connection ล้มเหลว | ตรวจ `.env`, `mysql -u project3 -p` |
| CORS error | domain ไม่ตรงใน server.js | แก้ `origin` ใน server.js แล้ว `pm2 restart` |
| วันที่ผิด | Server timezone ไม่ใช่ UTC+7 | ไม่กระทบ เพราะ backend ใช้ `Date.now() + 7*3600000` แล้ว |
| ชื่ออาจารย์ขึ้น "???" | `academictitle` table crash | REPAIR TABLE แล้ว restore ด้วย Node.js script |

---

## License

สงวนสิทธิ์ © มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ
