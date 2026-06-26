import { Outlet, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const MENU = [
  { label: 'จัดการข้อมูลพื้นฐาน', children: [
    { label: 'คำนำหน้าชื่อ', path: '/admin/titles' },
    { label: 'ตำแหน่งวิชาการ', path: '/admin/academic-titles' },
    { label: 'คณะ', path: '/admin/faculties' },
    { label: 'ภาควิชา', path: '/admin/departments' },
    { label: 'สาขา', path: '/admin/divisions' },
    { label: 'หลักสูตร', path: '/admin/curriculums' },
    { label: 'วิชา', path: '/admin/subjects' },
    { label: 'ห้องสอบ', path: '/admin/rooms' },
    { label: 'ประเภทการสอบ', path: '/admin/type-exams' },
    { label: 'สถานะโครงการ', path: '/admin/status-projects' },
    { label: 'สิทธิ์ผู้ใช้', path: '/admin/rights' },
  ]},
  { label: 'จัดการผู้ใช้', children: [
    { label: 'ผู้ใช้ทั้งหมด', path: '/admin/users' },
    { label: 'นักศึกษา', path: '/admin/students' },
    { label: 'อาจารย์', path: '/admin/teachers' },
    { label: 'เปลี่ยนหัวหน้าภาค', path: '/admin/head-of-department' },
  ]},
  { label: 'โครงการ', path: '/admin/projects' },
  { label: 'การสอบ', path: '/admin/exams' },
  { label: 'ปีการศึกษา', path: '/admin/academic-year' },
];

export default function AdminDashboard() {
  return (
    <Layout title="ผู้ดูแลระบบ" menuItems={MENU}>
      <Outlet />
    </Layout>
  );
}
