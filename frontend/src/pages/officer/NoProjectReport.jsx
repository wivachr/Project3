import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function NoProjectReport() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/no-project').then(r => setResult(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground text-sm">กำลังโหลด...</p>;

  return (
    <div>
      <h2 className="font-semibold text-xl tracking-tight mb-1">รายชื่อนักศึกษาที่ยังไม่มีหัวข้อ</h2>
      {result && (
        <p className="text-sm text-gray-500 mb-3">ปีการศึกษา {result.year} ภาค {result.semester}</p>
      )}

      {!result?.data?.length ? (
        <p className="text-muted-foreground text-sm">ไม่มีนักศึกษาที่ยังไม่มีหัวข้อ</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">รหัสนักศึกษา</th>
                <th className="px-3 py-2 text-left">ชื่อ-สกุล</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((s, i) => (
                <tr key={s.id_student} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="px-3 py-2 border-b border-gray-100">{i + 1}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{s.id_student}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{s.name_title}{s.name_student} {s.sname_student}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2">ทั้งหมด {result.data.length} คน</p>
        </div>
      )}
    </div>
  );
}
