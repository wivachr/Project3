import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ExpiredProjectReport() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ year: '', semester: '' });
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoaded(true);
    try {
      const res = await api.get('/reports/expired');
      setData(res.data.data);
      setMeta({ year: res.data.year, semester: res.data.semester });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-xl tracking-tight">รายงานโครงการค้างปี</h2>
          {meta.year && <p className="text-sm text-muted-foreground">โครงการที่ค้างมากกว่า 2 ภาคเรียน (ปัจจุบัน {meta.year}/{meta.semester})</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="border px-4 py-1.5 rounded-md text-sm hover:bg-muted">รีเฟรช</button>
          {data.length > 0 && <button onClick={() => window.print()} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90">พิมพ์</button>}
        </div>
      </div>

      {loading && <p className="text-muted-foreground text-sm">กำลังโหลด...</p>}
      {!loading && loaded && data.length === 0 && <p className="text-muted-foreground text-sm">ไม่มีโครงการค้างปี</p>}

      {data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="px-3 py-2 text-left w-8">#</th>
                <th className="px-3 py-2 text-left w-28">รหัสโครงการ</th>
                <th className="px-3 py-2 text-left">ชื่อโครงการ</th>
                <th className="px-3 py-2 text-left w-20">ปี/ภาค</th>
                <th className="px-3 py-2 text-left">ที่ปรึกษา</th>
                <th className="px-3 py-2 text-left">สมาชิก</th>
                <th className="px-3 py-2 text-left w-36">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={p.id_project} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                  <td className="px-3 py-2 border-b border-gray-100">{i + 1}</td>
                  <td className="px-3 py-2 border-b border-gray-100 whitespace-nowrap">{p.id_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{p.name_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100 whitespace-nowrap">{p.year_project}/{p.semester_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100 text-xs">{p.advisors || '-'}</td>
                  <td className="px-3 py-2 border-b border-gray-100 text-xs">{p.members || '-'}</td>
                  <td className="px-3 py-2 border-b border-gray-100">
                    <span className="px-2 py-0.5 rounded text-xs bg-orange-50 text-orange-700">{p.name_statusproject}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-2">ทั้งหมด {data.length} โครงการ</p>
        </div>
      )}
    </div>
  );
}
