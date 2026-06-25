import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AcademicYear() {
  const [data, setData] = useState({ year: '', semester: '' });
  const [form, setForm] = useState({ year: '', semester: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/lookups/academic-year');
      setData(res.data);
      setForm({ year: res.data.year || '', semester: res.data.semester || '' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.put('/lookups/academic-year', form);
      setMsg('บันทึกสำเร็จ');
      load();
    } catch { setMsg('เกิดข้อผิดพลาด'); }
    finally { setSaving(false); }
  };

  if (loading) return <p className="text-muted-foreground text-sm">กำลังโหลด...</p>;

  return (
    <div className="max-w-sm">
      <h2 className="font-semibold text-xl mb-4 tracking-tight">ปีการศึกษาปัจจุบัน</h2>

      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
        <p className="text-sm text-blue-700">ปีการศึกษา: <strong>{data.year || '-'}</strong></p>
        <p className="text-sm text-blue-700">ภาคเรียน: <strong>{data.semester || '-'}</strong></p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">ปีการศึกษา (พ.ศ.)</label>
          <input className="w-full border rounded px-3 py-1.5 text-sm mt-1 focus:outline-none focus:border-blue-500" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="เช่น 2567" />
        </div>
        <div>
          <label className="text-sm font-medium">ภาคเรียน</label>
          <select className="w-full border rounded px-3 py-1.5 text-sm mt-1" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        {msg && <p className={`text-sm ${msg.includes('สำเร็จ') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}
      </div>
    </div>
  );
}
