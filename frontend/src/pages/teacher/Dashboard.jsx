import { Outlet } from 'react-router-dom';
import Layout from '../../components/Layout';

const MENU = [
  { label: 'โครงการที่ปรึกษา', path: '/teacher/my-projects' },
  { label: 'โครงการทั้งหมด', path: '/teacher/projects' },
  { label: 'ตารางสอบ', path: '/teacher/exams' },
  { label: 'รายงานสถานะ', path: '/teacher/reports/status' },
  { label: 'จัดการเวลาว่าง', path: '/teacher/free-time' },
  { label: 'ข้อมูลส่วนตัว', path: '/teacher/profile' },
  { label: 'เปลี่ยนรหัสผ่าน', path: '/teacher/change-password' },
];

export default function TeacherDashboard() {
  return (
    <Layout title="อาจารย์" menuItems={MENU}>
      <Outlet />
    </Layout>
  );
}
