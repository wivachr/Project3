import { fmtDate } from '@/lib/utils';
import { useState } from 'react';
import api from '../../services/api';

export default function FallProjectReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [searched, setSearched] = useState(false);

  const load = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/reports/fall-project', { params: { year, semester } });
      setData(res.data);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">โครงงานที่สอบหัวข้อไม่ผ่าน</h2>
      <div className="flex gap-2 mb-4 flex-wrap">
        <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={semester} onChange={e => setSemester(e.target.value)}>
          <option value="">ทุกภาค</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
        <input className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-28" placeholder="ปีการศึกษา" value={year} onChange={e => setYear(e.target.value)} />
        <button onClick={load} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">ค้นหา</button>
      </div>

      {loading && <p className="text-muted-foreground text-sm">กำลังโหลด...</p>}
      {!loading && searched && data.length === 0 && <p className="text-muted-foreground text-sm">ไม่พบข้อมูล</p>}

      {data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">รหัสโครงการ</th>
                <th className="px-3 py-2 text-left">ชื่อโครงการ</th>
                <th className="px-3 py-2 text-left">ปี/ภาค</th>
                <th className="px-3 py-2 text-left">วันที่ยื่นสอบ</th>
                <th className="px-3 py-2 text-left">สถานะ</th>
                <th className="px-3 py-2 text-left">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={`${p.id_project}-${i}`} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="px-3 py-2 border-b border-gray-100">{i + 1}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{p.id_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{p.name_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{p.year_project}/{p.semester_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100">
                    {p.date_submitexam ? fmtDate(p.date_submitexam) : '-'}
                  </td>
                  <td className="px-3 py-2 border-b border-gray-100">
                    <span className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-700">{p.name_statusproject}</span>
                  </td>
                  <td className="px-3 py-2 border-b border-gray-100 text-xs text-gray-500">{p.comment_exam || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2">ทั้งหมด {data.length} โครงการ</p>
        </div>
      )}
    </div>
  );
}
