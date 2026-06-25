import { Outlet } from 'react-router-dom';
import Layout from '../../components/Layout';

const MENU = [
  { label: 'ข้อมูลโครงการ', path: '/student/project' },
  { label: 'ส่งสอบหัวข้อ', path: '/student/submit-title' },
  { label: 'ส่งสอบ 60%', path: '/student/submit-60' },
  { label: 'ส่งสอบ 100%', path: '/student/submit-100' },
  { label: 'ประวัติการสอบ', path: '/student/exam-history' },
  { label: 'ประวัติการแก้ไข', path: '/student/edit-history' },
  { label: 'อัปโหลดเล่มรายงาน', path: '/student/upload' },
  { label: 'ข้อมูลส่วนตัว', path: '/student/profile' },
  { label: 'เปลี่ยนรหัสผ่าน', path: '/student/change-password' },
];

export default function StudentDashboard() {
  return (
    <Layout title="นักศึกษา" menuItems={MENU}>
      <Outlet />
    </Layout>
  );
}
