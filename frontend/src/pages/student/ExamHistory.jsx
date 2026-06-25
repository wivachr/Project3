import { fmtDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ExamHistory() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exams/my').then(r => setExams(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground text-sm">กำลังโหลด...</p>;

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">ประวัติการสอบ</h2>

      {exams.length === 0 ? (
        <p className="text-muted-foreground text-sm">ยังไม่มีประวัติการสอบ</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">ประเภทสอบ</th>
                <th className="px-3 py-2 text-left">วันที่ยื่น</th>
                <th className="px-3 py-2 text-left">วันที่สอบ</th>
                <th className="px-3 py-2 text-left">เวลา</th>
                <th className="px-3 py-2 text-left">ห้อง</th>
                <th className="px-3 py-2 text-left">ผลการสอบ</th>
                <th className="px-3 py-2 text-left">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e, i) => (
                <tr key={e.id_exam} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="px-3 py-2 border-b border-gray-100">{i + 1}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{e.name_typeexam}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{e.date_submitexam ? fmtDate(e.date_submitexam) : '-'}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{e.date_assignexam ? fmtDate(e.date_assignexam) : '-'}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{e.time_assignexam || '-'}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{e.name_room || '-'}</td>
                  <td className="px-3 py-2 border-b border-gray-100">
                    {[24].includes(e.id_statusproject) ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">ผ่าน</span>
                    : [22,17,25].includes(e.id_statusproject) ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">ไม่ผ่าน</span>
                    : <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">รอผล</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-gray-100">{e.name_statusproject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
