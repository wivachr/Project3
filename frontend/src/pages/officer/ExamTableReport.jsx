import { fmtDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ExamTableReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [searched, setSearched] = useState(false);

  const load = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/exams', { params: { limit: 200, year, semester } });
      setData(res.data.data || []);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">ตารางสอบ</h2>
      <div className="flex gap-2 mb-4 flex-wrap">
        <input className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-28" placeholder="ปีการศึกษา" value={year} onChange={e => setYear(e.target.value)} />
        <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={semester} onChange={e => setSemester(e.target.value)}>
          <option value="">ทุกภาค</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
        <button onClick={load} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">แสดงตารางสอบ</button>
      </div>

      {loading && <p className="text-muted-foreground text-sm">กำลังโหลด...</p>}
      {!loading && searched && data.length === 0 && <p className="text-muted-foreground text-sm">ไม่พบข้อมูล</p>}

      {data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">ชื่อโครงการ</th>
                <th className="px-3 py-2 text-left">ประเภทสอบ</th>
                <th className="px-3 py-2 text-left">วันที่สอบ</th>
                <th className="px-3 py-2 text-left">เวลา</th>
                <th className="px-3 py-2 text-left">ห้อง</th>
                <th className="px-3 py-2 text-left">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {data.map((e, i) => (
                <tr key={e.id_exam} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="px-3 py-2 border-b border-gray-100">{i + 1}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{e.name_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{e.name_typeexam}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{e.date_assignexam ? fmtDate(e.date_assignexam) : '-'}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{e.time_assignexam ? `${e.time_assignexam}-${e.endtime_assignexam}` : '-'}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{e.name_room || '-'}</td>
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
