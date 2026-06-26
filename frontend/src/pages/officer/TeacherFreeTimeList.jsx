import { useState, useEffect } from 'react';
import api from '../../services/api';

const DAYS = ['จ', 'อ', 'พ', 'พฤ', 'ศ'];
const PERIODS = Array.from({ length: 12 }, (_, i) => String(i + 1));

export default function TeacherFreeTimeList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState('');

  useEffect(() => {
    api.get('/teachers/freetime-all')
      .then(r => setTeachers(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = key
    ? teachers.filter(t => String(t.id_teacher) === key)
    : teachers;

  const hasSlot = (t, day, time) => t.slots.some(s => s.day === day && s.time === time);

  if (loading) return <p className="text-muted-foreground text-sm">กำลังโหลด...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-xl tracking-tight">ตารางเวลาว่างอาจารย์</h2>
        <select
          className="border rounded px-3 py-1.5 text-sm w-64 bg-background"
          value={key}
          onChange={e => setKey(e.target.value)}
        >
          <option value="">— แสดงทั้งหมด —</option>
          {teachers.map(t => (
            <option key={t.id_teacher} value={String(t.id_teacher)}>
              {t.name_academictitle || ''}{t.name_teacher} {t.sname_teacher}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr className="bg-muted">
              <th className="border px-2 py-1 text-left w-48">อาจารย์</th>
              {DAYS.map((d, di) => (
                PERIODS.map(p => (
                  <th key={`${di}-${p}`} className="border px-1 py-1 text-center w-8">{d}{p}</th>
                ))
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={1 + DAYS.length * PERIODS.length} className="text-center py-4 text-muted-foreground">ไม่พบข้อมูล</td></tr>
            )}
            {filtered.map(t => (
              <tr key={t.id_teacher} className="hover:bg-muted/30">
                <td className="border px-2 py-1 whitespace-nowrap">
                  {t.name_academictitle || ''}{t.name_teacher} {t.sname_teacher}
                </td>
                {DAYS.map((_, di) => (
                  PERIODS.map(p => (
                    <td key={`${di}-${p}`} className="border text-center">
                      {hasSlot(t, String(di + 1), p) && (
                        <span className="block w-full h-full bg-primary/20 text-primary text-center">✓</span>
                      )}
                    </td>
                  ))
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">ทั้งหมด {filtered.length} คน | ✓ = ว่าง</p>
    </div>
  );
}
