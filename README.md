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

### ข้อมูลที่ใช้ร่วมกัน

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
│   │   │                 exams, news, registers, lookups, reports
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
        │   ├── admin/
        │   ├── officer/
        │   ├── teacher/
        │   ├── student/
        │   └── shared/
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
| 1 | Admin | จัดการผู้ใช้ ข้อมูลพื้นฐาน |
| 2 | เจ้าหน้าที่ | จัดการโครงการ การสอบ ข่าว ปีการศึกษา |
| 3 | อาจารย์ | ดูโครงการในที่ปรึกษา ดูตารางสอบ |
| 4 | นักศึกษา | ดูโครงการตัวเอง ส่งคำร้องสอบ อัปโหลด PDF |

---

## ฟีเจอร์หลัก

### เจ้าหน้าที่
- รายชื่อนักศึกษา / อาจารย์ / ลงทะเบียน
- รายการโครงการ (ค้นหา / กรอง)
- รอสอบหัวข้อ / 60% / 100%
- มอบหมายกรรมการ, กำหนดวันสอบ, บันทึกผลสอบ
- จัดการการส่งปริญญานิพนธ์ฉบับสมบูรณ์
- รายงาน: ตารางสอบ, ผลสอบ, สถานะโครงการ, นักศึกษาไม่มีหัวข้อ
- ข่าวประกาศ, ตั้งค่าปีการศึกษา

### อาจารย์
- โครงการที่ปรึกษา, ตารางสอบ, รายงานสถานะ

### นักศึกษา
- ข้อมูลโครงการ, ส่งคำร้องสอบ, ประวัติการสอบ, อัปโหลดเล่มรายงาน PDF

---

## วันที่และปีการศึกษา

ฐานข้อมูลเก็บวันที่เป็น **พุทธศักราช (พ.ศ.)** โดยตรงใน MySQL DATE column (เช่น `2569-06-10`)

- ห้ามใช้ `toLocaleDateString('th-TH')` — จะบวก 543 ซ้ำทำให้ปีกลายเป็น 3112
- ใช้ `fmtDate(dateStr)` จาก `frontend/src/lib/utils.js` แทน
- `ThaiDatePicker` จัดการแปลง พ.ศ. ↔ ค.ศ. สำหรับ `<input type="date">` อัตโนมัติ
- Pool config มี `dateStrings: true` — ป้องกัน mysql2 แปลง DATE เป็น JS Date object แล้ว serialize เป็น UTC ทำให้วันเลื่อน (เช่น `2569-06-25` กลายเป็น `"2569-06-24T17:00:00.000Z"`)
- เมื่อ INSERT วันที่จาก backend ให้คำนวณปี พ.ศ. และใช้ UTC+7: `new Date(Date.now() + 7*3600000)` แล้วอ่านด้วย `getUTCFullYear/Month/Date`

---

## License

สงวนสิทธิ์ © มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ
