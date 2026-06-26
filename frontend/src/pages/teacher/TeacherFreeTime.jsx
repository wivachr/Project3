import { useState, useEffect } from 'react';
import api from '../../services/api';

const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
const PERIODS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAY_KEYS = ['1', '2', '3', '4', '5'];

export default function TeacherFreeTime() {
  const [slots, setSlots] = useState(new Set()); // "day-time" strings
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/teachers/freetime').then(res => {
      const s = new Set(res.data.map(r => `${r.day_freetime}-${r.time_freetime}`));
      setSlots(s);
    }).finally(() => setLoading(false));
  }, []);

  const toggle = (day, time) => {
    const key = `${day}-${time}`;
    setSlots(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const arr = [...slots].map(k => {
        const [day, time] = k.split('-');
        return { day, time };
      });
      await api.put('/teachers/freetime', { slots: arr });
      setMsg('บันทึกสำเร็จ');
    } catch (e) {
      setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally { setSaving(false); }
  };

  if (loading) return <p className="text-muted-foreground text-sm">กำลังโหลด...</p>;

  return (
    <div>
      <h2 className="font-semibold text-xl mb-1 tracking-tight">จัดการเวลาว่าง</h2>
      <p className="text-xs text-muted-foreground mb-4">
        เลือกเฉพาะเวลาที่ <span className="font-medium">ไม่ว่าง</span> (มีการสอนหรือติดภารกิจ)
      </p>

      <div className="rounded-md border overflow-x-auto mb-4">
        <table className="text-sm border-collapse">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="px-3 py-2 text-left whitespace-nowrap">คาบ / วัน</th>
              {DAYS.map((d, i) => (
                <th key={i} className="px-4 py-2 text-center whitespace-nowrap">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(p => (
              <tr key={p} className={p % 2 === 0 ? 'bg-muted/30' : ''}>
                <td className="px-3 py-2 font-medium text-center">{p}</td>
                {DAY_KEYS.map(d => {
                  const checked = slots.has(`${d}-${p}`);
                  return (
                    <td key={d} className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(d, p)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกเวลาว่าง'}
        </button>
        {msg && <span className={`text-sm ${msg.includes('สำเร็จ') ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</span>}
      </div>
    </div>
  );
}
