import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function NoExamReport() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/no-exam').then(r => setResult(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground text-sm">กำลังโหลด...</p>;

  return (
    <div>
      <h2 className="font-semibold text-xl tracking-tight mb-1">โครงงานที่ยังไม่ยื่นสอบร้อยเปอร์เซ็นต์</h2>
      {result && (
        <p className="text-sm text-gray-500 mb-3">
          โครงการจากปีก่อนปีการศึกษา {result.year} ภาค {result.semester} ที่ยังไม่เสร็จสิ้น
        </p>
      )}

      {!result?.data?.length ? (
        <p className="text-muted-foreground text-sm">ไม่มีโครงงานค้างชำระ</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">รหัสโครงการ</th>
                <th className="px-3 py-2 text-left">ชื่อโครงการ</th>
                <th className="px-3 py-2 text-left">ปี/ภาค</th>
                <th className="px-3 py-2 text-left">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((p, i) => (
                <tr key={p.id_project} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="px-3 py-2 border-b border-gray-100">{i + 1}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{p.id_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{p.name_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{p.year_project}/{p.semester_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100">
                    <span className="px-2 py-0.5 rounded text-xs bg-yellow-50 text-yellow-700">{p.name_statusproject}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2">ทั้งหมด {result.data.length} โครงการ</p>
        </div>
      )}
    </div>
  );
}
