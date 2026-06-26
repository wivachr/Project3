import { useState, useEffect } from 'react';
import api from '../../services/api';

const stripTitles = (str) => str ? str.replace(/(?:นางสาว|นาง|นาย)\s*/g, '') : '-';

export default function TorgorList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', { params: { status: 15, limit: 200 } });
      const all = res.data.data || [];
      setData(all.filter(p => p.id_statusproject === 15));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async (p) => {
    if (!window.confirm(`รับทก.01 ของโครงการ "${p.name_project}" ?`)) return;
    try {
      await api.post(`/projects/${p.id_project}/torgor`);
      setMsg(`รับทก.01 โครงการ ${p.id_project} เรียบร้อย`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">จัดการการส่ง ทก.01</h2>
      <p className="text-sm text-muted-foreground mb-4">โครงการที่สอบหัวข้อผ่านแล้ว รอส่งแบบฟอร์ม ทก.01</p>
      {msg && <p className="text-sm text-emerald-600 mb-3">{msg}</p>}
      {loading && <p className="text-muted-foreground text-sm">กำลังโหลด...</p>}
      {!loading && data.length === 0 && <p className="text-muted-foreground text-sm">ไม่มีโครงการที่รอการส่ง ทก.01</p>}
      {data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">รหัสโครงการ</th>
                <th className="px-3 py-2 text-left">ชื่อโครงการ</th>
                <th className="px-3 py-2 text-left">ปี/ภาค</th>
                <th className="px-3 py-2 text-left">ที่ปรึกษา</th>
                <th className="px-3 py-2 text-left">สมาชิก</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={p.id_project} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                  <td className="px-3 py-2 border-b border-gray-100">{i + 1}</td>
                  <td className="px-3 py-2 border-b border-gray-100 whitespace-nowrap">{p.id_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100">{p.name_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100 whitespace-nowrap">{p.year_project}/{p.semester_project}</td>
                  <td className="px-3 py-2 border-b border-gray-100 text-xs">{stripTitles(p.advisors)}</td>
                  <td className="px-3 py-2 border-b border-gray-100 text-xs">{stripTitles(p.members)}</td>
                  <td className="px-3 py-2 border-b border-gray-100">
                    <button onClick={() => handleConfirm(p)} className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs hover:bg-primary/90">
                      รับ ทก.01
                    </button>
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
