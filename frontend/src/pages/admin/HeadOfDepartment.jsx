import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function HeadOfDepartment() {
  const [current, setCurrent] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/headofdepartment'),
      api.get('/teachers', { params: { limit: 200 } }),
    ]).then(([h, t]) => {
      setCurrent(h.data);
      setTeachers(t.data.data || []);
      if (h.data) setSelected(String(h.data.id_teacher));
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!selected) return;
    try {
      await api.put('/headofdepartment', { id_teacher: selected });
      setMsg('บันทึกสำเร็จ');
      const h = await api.get('/headofdepartment');
      setCurrent(h.data);
    } catch (e) {
      setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  if (loading) return <p className="text-muted-foreground text-sm">กำลังโหลด...</p>;

  return (
    <div className="max-w-md">
      <h2 className="font-semibold text-xl mb-4 tracking-tight">เปลี่ยนหัวหน้าภาค</h2>

      <div className="rounded-md border p-4 mb-4 bg-muted/20">
        <p className="text-sm text-muted-foreground mb-1">หัวหน้าภาคปัจจุบัน</p>
        {current
          ? <p className="font-medium">{current.name_academictitle}{current.name_teacher} {current.sname_teacher}</p>
          : <p className="text-muted-foreground text-sm">ยังไม่มีหัวหน้าภาค</p>}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm w-24 shrink-0">อาจารย์</label>
          <select
            className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={selected}
            onChange={e => setSelected(e.target.value)}
          >
            <option value="">--- เลือกอาจารย์ ---</option>
            {teachers.map(t => (
              <option key={t.id_teacher} value={t.id_teacher}>
                {t.name_academictitle}{t.name_teacher} {t.sname_teacher}
              </option>
            ))}
          </select>
        </div>
        {msg && <p className={`text-sm ${msg.includes('สำเร็จ') ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</p>}
        <button
          onClick={handleSave}
          disabled={!selected}
          className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          เปลี่ยนหัวหน้าภาค
        </button>
      </div>
    </div>
  );
}
