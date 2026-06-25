import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentProfile() {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects/my').then(r => {
      if (r.data) {
        setProject(r.data);
        setMembers(r.data.manipulators || []);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground text-sm">กำลังโหลด...</p>;

  return (
    <div className="max-w-md">
      <h2 className="font-semibold text-xl mb-4 tracking-tight">ข้อมูลส่วนตัว</h2>

      <div className="bg-white border rounded divide-y mb-4">
        <div className="flex px-4 py-2.5 text-sm">
          <span className="w-36 text-gray-500 shrink-0">ชื่อผู้ใช้</span>
          <span className="font-medium">{user?.username || '-'}</span>
        </div>
        <div className="flex px-4 py-2.5 text-sm">
          <span className="w-36 text-gray-500 shrink-0">ชื่อบัญชี</span>
          <span className="font-medium">{user?.fullname || '-'}</span>
        </div>
        <div className="flex px-4 py-2.5 text-sm">
          <span className="w-36 text-gray-500 shrink-0">สิทธิ์</span>
          <span className="font-medium">นักศึกษา</span>
        </div>
      </div>

      {project && (
        <div>
          <h3 className="font-medium text-sm mb-2">โครงการ</h3>
          <div className="bg-white border rounded divide-y">
            <div className="flex px-4 py-2.5 text-sm">
              <span className="w-36 text-gray-500 shrink-0">รหัสโครงการ</span>
              <span className="font-medium">{project.id_project}</span>
            </div>
            <div className="flex px-4 py-2.5 text-sm">
              <span className="w-36 text-gray-500 shrink-0">ชื่อโครงการ</span>
              <span className="font-medium">{project.name_project}</span>
            </div>
            <div className="flex px-4 py-2.5 text-sm">
              <span className="w-36 text-gray-500 shrink-0">สถานะ</span>
              <span className="font-medium text-blue-700">{project.name_statusproject}</span>
            </div>
          </div>
        </div>
      )}

      {!project && <p className="text-muted-foreground text-sm">ยังไม่มีข้อมูลโครงการ</p>}
    </div>
  );
}
