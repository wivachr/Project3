import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

const emptyForm = { id_project: '', location_race: '', status_race: '' };

export default function RaceList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | 'add' | {row}
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');

  const load = async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/races', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);
  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const openAdd = () => { setForm(emptyForm); setModal('add'); setMsg(''); };
  const openEdit = (r) => { setForm({ id_project: r.id_project, location_race: r.location_race, status_race: r.status_race }); setModal(r); setMsg(''); };

  const handleSave = async () => {
    if (!form.id_project || !form.location_race) { setMsg('กรุณากรอกรหัสโครงการและชื่อการแข่งขัน'); return; }
    try {
      if (modal === 'add') {
        await api.post('/races', form);
      } else {
        await api.put(`/races/${modal.id_race}`, form);
      }
      setModal(null);
      load(page, search);
    } catch (e) { setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`ลบข้อมูลการแข่งขันนี้?`)) return;
    try { await api.delete(`/races/${r.id_race}`); load(page, search); }
    catch (e) { alert(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const columns = [
    { key: 'id_race', label: '#', className: 'w-12 whitespace-nowrap' },
    { key: 'id_project', label: 'รหัสโครงการ', className: 'w-28 whitespace-nowrap' },
    { key: 'name_project', label: 'ชื่อโครงการ' },
    { key: 'location_race', label: 'การแข่งขัน/สถานที่' },
    { key: 'status_race', label: 'ผลการแข่งขัน', className: 'w-44' },
    { key: 'action', label: '', className: 'w-24 whitespace-nowrap', render: r => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="text-xs text-primary hover:underline">แก้ไข</button>
        <button onClick={() => handleDelete(r)} className="text-xs text-red-500 hover:underline">ลบ</button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-xl tracking-tight">จัดการข้อมูลการแข่งขัน</h2>
        <button onClick={openAdd} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">+ เพิ่มข้อมูล</button>
      </div>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหาโครงการ/การแข่งขัน..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); load(p, search); }} />
      <p className="text-xs text-gray-400 mt-2">ทั้งหมด {total} รายการ</p>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border rounded-lg shadow-lg p-6 w-[480px] max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold mb-4">{modal === 'add' ? 'เพิ่มข้อมูลการแข่งขัน' : 'แก้ไขข้อมูลการแข่งขัน'}</h3>
            <div className="space-y-3">
              {[
                { k: 'id_project', lbl: 'รหัสโครงการ', req: true },
                { k: 'location_race', lbl: 'การแข่งขัน/สถานที่', req: true },
                { k: 'status_race', lbl: 'ผลการแข่งขัน' },
              ].map(({ k, lbl, req }) => (
                <div key={k} className="flex items-start gap-2">
                  <label className="text-sm w-40 shrink-0 pt-2">{lbl}{req && <span className="text-red-500">*</span>}</label>
                  <input
                    className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            {msg && <p className="text-red-500 text-xs mt-2">{msg}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">บันทึก</button>
              <button onClick={() => setModal(null)} className="border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
