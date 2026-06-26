import { Outlet } from 'react-router-dom';
import Layout from '../../components/Layout';

const MENU = [
  { label: 'นักศึกษา', path: '/officer/students' },
  { label: 'อาจารย์', path: '/officer/teachers' },
  { label: 'ลงทะเบียน', path: '/officer/registers' },
  { label: 'โครงการ', children: [
    { label: 'รายการโครงการ', path: '/officer/projects' },
    { label: 'รอสอบหัวข้อ', path: '/officer/projects/pending-title' },
    { label: 'รอสอบ 60%', path: '/officer/projects/pending-60' },
    { label: 'รอสอบ 100%', path: '/officer/projects/pending-100' },
    { label: 'มอบหมายกรรมการ', path: '/officer/projects/assign-committee' },
    { label: 'กำหนดวันสอบ', path: '/officer/projects/assign-exam' },
    { label: 'บันทึกผลการสอบ', path: '/officer/projects/save-result' },
    { label: 'จัดการการส่งปริญญานิพนธ์', path: '/officer/projects/submit-book' },
    { label: 'จัดการการส่ง ทก.01', path: '/officer/projects/torgor' },
  ]},
  { label: 'การสอบ', path: '/officer/exams' },
  { label: 'การแข่งขัน', path: '/officer/races' },
  { label: 'ตารางเวลาว่างอาจารย์', path: '/officer/teacher-freetime' },
  { label: 'รายงาน', children: [
    { label: 'ตารางสอบ', path: '/officer/reports/exam-table' },
    { label: 'ผลการสอบ', path: '/officer/reports/results' },
    { label: 'สถานะโครงการ', path: '/officer/reports/status' },
    { label: 'นักศึกษาไม่มีหัวข้อ', path: '/officer/reports/no-project' },
    { label: 'โครงการค้างชำระ', path: '/officer/reports/no-exam' },
    { label: 'สอบหัวข้อไม่ผ่าน', path: '/officer/reports/fall-project' },
    { label: 'พิมพ์ใบยื่นสอบ', path: '/officer/reports/print-exam' },
    { label: 'ใบประเมินการสอบ', path: '/officer/reports/evaluation' },
    { label: 'โครงการกรณีศึกษา', path: '/officer/reports/case-study' },
    { label: 'โครงการค้างปี', path: '/officer/reports/expired' },
  ]},
  { label: 'ข่าวประกาศ', path: '/officer/news' },
  { label: 'ปีการศึกษา', path: '/officer/academic-year' },
];

export default function OfficerDashboard() {
  return (
    <Layout title="เจ้าหน้าที่" menuItems={MENU}>
      <Outlet />
    </Layout>
  );
}
