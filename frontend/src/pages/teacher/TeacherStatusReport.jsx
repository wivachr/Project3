import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TeacherStatusReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');

  const load = async (k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/projects', { params: { limit: 200, key: k } });
      setData(res.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => { setSearch(key); load(key); };

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">รายงานสถานะโครงการ</h2>
      <div className="flex gap-2 mb-4">
        <input className="border rounded px-3 py-1.5 text-sm flex-1" placeholder="ค้นหาโครงการ..." value={key} onChange={e => setKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button onClick={handleSearch} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">ค้นหา</button>
      </div>
      {loading ? <p className="text-muted-foreground text-sm">กำลังโหลด...</p> : (
        data.length === 0 ? <p className="text-muted-foreground text-sm">ไม่พบข้อมูล</p> : (
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="px-3 py-2 text-left w-10 whitespace-nowrap">#</th>
                  <th className="px-3 py-2 text-left w-24 whitespace-nowrap">รหัสโครงการ</th>
                  <th className="px-3 py-2 text-left">ชื่อโครงการ</th>
                  <th className="px-3 py-2 text-left w-36">สมาชิก</th>
                  <th className="px-3 py-2 text-left w-52">ที่ปรึกษา</th>
                  <th className="px-3 py-2 text-left w-44 whitespace-nowrap">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p, i) => (
                  <tr key={p.id_project} className={i % 2 === 0 ? '' : 'bg-muted/30'}>
                    <td className="px-3 py-2 border-b border-border whitespace-nowrap">{i + 1}</td>
                    <td className="px-3 py-2 border-b border-border whitespace-nowrap">{p.id_project}</td>
                    <td className="px-3 py-2 border-b border-border">{p.name_project}</td>
                    <td className="px-3 py-2 border-b border-border text-xs leading-snug">{p.members || '-'}</td>
                    <td className="px-3 py-2 border-b border-border"><div className="text-xs leading-snug line-clamp-3">{p.advisors || '-'}</div></td>
                    <td className="px-3 py-2 border-b border-border whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">{p.name_statusproject}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
