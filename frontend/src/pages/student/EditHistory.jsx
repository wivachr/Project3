import { fmtDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function EditHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects/my/history').then(r => setHistory(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground text-sm">กำลังโหลด...</p>;

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">ประวัติการแก้ไขโครงการ</h2>

      {history.length === 0 ? (
        <p className="text-muted-foreground text-sm">ยังไม่มีประวัติการแก้ไข</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">วันที่แก้ไข</th>
                <th className="px-3 py-2 text-left">ประเภทการแก้ไข</th>
                <th className="px-3 py-2 text-left">ข้อมูลก่อนการแก้ไข</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={h.id_projecthistory} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="px-3 py-2 border-b border-gray-100">{i + 1}</td>
                  <td className="px-3 py-2 border-b border-gray-100">
                    {h.date_edit ? fmtDate(h.date_edit) : '-'}
                  </td>
                  <td className="px-3 py-2 border-b border-gray-100">{h.typeedit}</td>
                  <td className="px-3 py-2 border-b border-gray-100">
                    {(h.typeedit === 'เพิ่มขอบเขต' || h.typeedit === 'ลดขอบเขต') && h.olddata ? (
                      <a href={`http://localhost:5000${h.olddata}`} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">ดู ทก.</a>
                    ) : (
                      <span className="text-gray-700">{h.olddata}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
