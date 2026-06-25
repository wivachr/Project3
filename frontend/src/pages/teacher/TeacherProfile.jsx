import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TeacherProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teachers/me').then(r => setProfile(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground text-sm">กำลังโหลด...</p>;
  if (!profile) return <p className="text-muted-foreground text-sm">ไม่พบข้อมูลอาจารย์</p>;

  const fields = [
    { label: 'รหัสอาจารย์', value: profile.id_teacher },
    { label: 'ชื่อ-สกุล', value: `${profile.name_academictitle || ''}${profile.name_title || ''}${profile.name_teacher || ''} ${profile.sname_teacher || ''}`.trim() },
    { label: 'คณะ', value: profile.name_faculty },
    { label: 'สาขาวิชา', value: profile.name_department },
    { label: 'อีเมล', value: profile.email_teacher },
    { label: 'โทรศัพท์', value: profile.tel_teacher },
  ];

  return (
    <div className="max-w-md">
      <h2 className="font-semibold text-xl mb-4 tracking-tight">ข้อมูลส่วนตัว</h2>
      <div className="bg-white border rounded divide-y">
        {fields.map(f => (
          <div key={f.label} className="flex px-4 py-2.5 text-sm">
            <span className="w-36 text-gray-500 shrink-0">{f.label}</span>
            <span className="font-medium">{f.value || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
