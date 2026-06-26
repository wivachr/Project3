import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function CaseStudyReport() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ year: '', semester: '' });
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.get('/lookups/academic-year').then(r => {
      setYear(r.data.year || '');
      setSemester(r.data.semester || '');
    });
  }, []);

  const load = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/reports/case-study', { params: { year, semester } });
      setData(res.data.data);
      setMeta({ year: res.data.year, semester: res.data.semester });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">รายงานโครงการกรณีศึกษา</h2>
      <div className="flex gap-2 mb-4 flex-wrap">
        <select className="flex h-9 min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={semester} onChange={e => setSemester(e.target.value)}>
          <option value="">ทุกภาค</option>
          <option value="1">ภาค 1</option>
          <option value="2">ภาค 2</option>
          <option value="3">ภาค 3</option>
        </select>
        <input className="flex h-9 w-32 min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="ปีการศึกษา" value={year} onChange={e => setYear(e.target.value)} />
        <button onClick={load} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90">ค้นหา</button>
        {data.length > 0 && <button onClick={() => window.print()} className="border px-4 py-1.5 rounded-md text-sm hover:bg-muted">พิมพ์</button>}
      </div>

      {loading && <p className="text-muted-foreground text-sm">กำลังโหลด...</p>}
      {!loading && searched && data.length === 0 && <p className="text-muted-foreground text-sm">ไม่พบโครงการกรณีศึกษาในปี {meta.year} ภาค {meta.semester}</p>}

      {data.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-2">ปีการศึกษา {meta.year} ภาค {meta.semester}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left w-8">#</th>
                  <th className="px-3 py-2 text-left w-28">รหัสโครงการ</th>
                  <th className="px-3 py-2 text-left">ชื่อโครงการ</th>
                  <th className="px-3 py-2 text-left">กรณีศึกษา / ขอบเขต</th>
                  <th className="px-3 py-2 text-left w-36">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p, i) => (
                  <tr key={p.id_project} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                    <td className="px-3 py-2 border-b border-gray-100">{i + 1}</td>
                    <td className="px-3 py-2 border-b border-gray-100 whitespace-nowrap">{p.id_project}</td>
                    <td className="px-3 py-2 border-b border-gray-100">{p.name_project}</td>
                    <td className="px-3 py-2 border-b border-gray-100 text-xs text-gray-600">{p.casestudy_project}</td>
                    <td className="px-3 py-2 border-b border-gray-100">
                      <span className="px-2 py-0.5 rounded text-xs bg-muted">{p.name_statusproject}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-2">ทั้งหมด {data.length} โครงการ</p>
          </div>
        </>
      )}
    </div>
  );
}
