import { fmtDate } from '@/lib/utils';
import { useState } from 'react';
import api from '../../services/api';

const isPass = (id) => id === 24 || id === 15 || id === 10 || id === 14 || id === 16;
const isFail = (id) => id === 22 || id === 17 || id === 25;

export default function ResultReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeexam, setTypeexam] = useState('');
  const [searched, setSearched] = useState(false);

  const load = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/exams', { params: { limit: 500, typeexam } });
      setData(res.data.data || []);
    } finally { setLoading(false); }
  };

  const pass = data.filter(e => isPass(e.id_statusproject)).length;
  const fail = data.filter(e => isFail(e.id_statusproject)).length;

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">รายงานผลการสอบ</h2>
      <div className="flex gap-2 mb-4">
        <select className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={typeexam} onChange={e => setTypeexam(e.target.value)}>
          <option value="">ทุกประเภทสอบ</option>
          <option value="1">สอบหัวข้อ</option>
          <option value="3">สอบ 60%</option>
          <option value="2">สอบ 100%</option>
        </select>
        <button onClick={load} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">แสดงรายงาน</button>
      </div>

      {loading && <p className="text-muted-foreground text-sm">กำลังโหลด...</p>}

      {!loading && searched && (
        <>
          <div className="flex gap-4 mb-4">
            <div className="bg-green-50 border border-green-200 rounded p-3 text-center min-w-[80px]">
              <p className="text-2xl font-bold text-green-600">{pass}</p>
              <p className="text-xs text-green-700">ผ่าน</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3 text-center min-w-[80px]">
              <p className="text-2xl font-bold text-red-600">{fail}</p>
              <p className="text-xs text-red-700">ไม่ผ่าน</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center min-w-[80px]">
              <p className="text-2xl font-bold text-gray-600">{data.length - pass - fail}</p>
              <p className="text-xs text-gray-600">รอผล</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center min-w-[80px]">
              <p className="text-2xl font-bold text-blue-600">{data.length}</p>
              <p className="text-xs text-blue-700">ทั้งหมด</p>
            </div>
          </div>

          {data.length === 0 ? (
            <p className="text-muted-foreground text-sm">ไม่พบข้อมูล</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-800 text-white">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">ชื่อโครงการ</th>
                    <th className="px-3 py-2 text-left">ประเภทสอบ</th>
                    <th className="px-3 py-2 text-left">วันที่สอบ</th>
                    <th className="px-3 py-2 text-left">ผลการสอบ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((e, i) => {
                    const p = isPass(e.id_statusproject);
                    const f = isFail(e.id_statusproject);
                    return (
                      <tr key={e.id_exam} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                        <td className="px-3 py-2 border-b border-gray-100">{i + 1}</td>
                        <td className="px-3 py-2 border-b border-gray-100">{e.name_project}</td>
                        <td className="px-3 py-2 border-b border-gray-100">{e.name_typeexam}</td>
                        <td className="px-3 py-2 border-b border-gray-100">{e.date_assignexam ? fmtDate(e.date_assignexam) : '-'}</td>
                        <td className="px-3 py-2 border-b border-gray-100">
                          {p ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">ผ่าน</span>
                           : f ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">ไม่ผ่าน</span>
                           : <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">{e.name_statusproject}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
