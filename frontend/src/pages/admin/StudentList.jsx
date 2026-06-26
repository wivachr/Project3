import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

const EMPTY = { id_student: '', id_title: '', name_student: '', sname_student: '', id_faculty: '', id_department: '', id_division: '', id_curr: '' };

export default function StudentList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');
  const [lookups, setLookups] = useState({ titles: [], faculties: [], departments: [], divisions: [], curriculums: [] });
  const [importMsg, setImportMsg] = useState('');

  const load = useCallback(async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/students', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [page]);

  useEffect(() => {
    Promise.all([
      api.get('/lookups/titles'),
      api.get('/lookups/faculties'),
      api.get('/lookups/departments'),
      api.get('/lookups/divisions'),
      api.get('/lookups/curriculums'),
    ]).then(([t, f, d, dv, c]) => setLookups({ titles: t.data, faculties: f.data, departments: d.data, divisions: dv.data, curriculums: c.data }));
  }, []);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const openAdd = () => { setForm(EMPTY); setModal('add'); setMsg(''); };
  const openEdit = (r) => { setForm({ id_student: r.id_student, id_title: r.id_title || '', name_student: r.name_student, sname_student: r.sname_student, id_faculty: r.id_faculty || '', id_department: r.id_department || '', id_division: r.id_division || '', id_curr: r.id_curr || '' }); setModal(r); setMsg(''); };

  const handleSave = async () => {
    if (!form.id_student || !form.name_student || !form.sname_student) { setMsg('กรุณากรอก รหัส ชื่อ นามสกุล'); return; }
    try {
      if (modal === 'add') await api.post('/students', form);
      else await api.put(`/students/${modal.id_student}`, form);
      setModal(null);
      load(page, search);
    } catch (e) { setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`ลบนักศึกษา ${r.id_student} ?`)) return;
    await api.delete(`/students/${r.id_student}`);
    load(page, search);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim().replace(/\r$/, '')));
    if (!rows.length) { setImportMsg('ไม่พบข้อมูล'); return; }
    try {
      const res = await api.post('/students/import', { rows });
      setImportMsg(res.data.message);
      load(1, '');
    } catch (e2) { setImportMsg(e2.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const columns = [
    { key: 'id_student', label: 'รหัสนักศึกษา', className: 'w-40 whitespace-nowrap' },
    { key: 'name_student', label: 'ชื่อ', render: r => r.name_student ? `${r.name_title || ''}${r.name_student} ${r.sname_student || ''}`.trim() : '-' },
    { key: 'name_faculty', label: 'คณะ', className: 'w-72 whitespace-nowrap' },
    { key: 'name_department', label: 'ภาควิชา', className: 'w-40 whitespace-nowrap' },
    { key: 'action', label: '', className: 'w-24 whitespace-nowrap', render: r => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="text-xs text-primary hover:underline">แก้ไข</button>
        <button onClick={() => handleDelete(r)} className="text-xs text-red-500 hover:underline">ลบ</button>
      </div>
    )},
  ];

  const sel = (k, lbl, opts) => (
    <div className="flex items-center gap-2">
      <label className="text-sm w-28 shrink-0">{lbl}</label>
      <select className="flex-1 border rounded px-2 py-1 text-sm" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}>
        <option value="">-- เลือก --</option>
        {opts.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-xl tracking-tight">รายชื่อนักศึกษา</h2>
        <div className="flex items-center gap-2">
          {importMsg && <span className="text-xs text-emerald-600">{importMsg}</span>}
          <label className="border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors cursor-pointer">
            นำเข้า CSV
            <input type="file" accept=".txt,.csv" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={openAdd} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90">+ เพิ่ม</button>
        </div>
      </div>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหารหัส/ชื่อ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); load(p, search); }} />
      <p className="text-xs text-gray-400 mt-2">ทั้งหมด {total} รายการ</p>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold mb-4">{modal === 'add' ? 'เพิ่มนักศึกษา' : 'แก้ไขนักศึกษา'}</h3>
            <div className="space-y-3">
              {[
                { k: 'id_student', lbl: 'รหัสนักศึกษา', disabled: modal !== 'add' },
                { k: 'name_student', lbl: 'ชื่อ' },
                { k: 'sname_student', lbl: 'นามสกุล' },
              ].map(({ k, lbl, disabled }) => (
                <div key={k} className="flex items-center gap-2">
                  <label className="text-sm w-28 shrink-0">{lbl}</label>
                  <input className="flex-1 border rounded px-2 py-1 text-sm disabled:bg-gray-100" disabled={disabled}
                    value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              {sel('id_title', 'คำนำหน้า', lookups.titles)}
              {sel('id_faculty', 'คณะ', lookups.faculties)}
              {sel('id_department', 'ภาควิชา', lookups.departments)}
              {sel('id_division', 'สาขา', lookups.divisions)}
              {sel('id_curr', 'หลักสูตร', lookups.curriculums)}
            </div>
            {msg && <p className="text-red-500 text-sm mt-2">{msg}</p>}
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setModal(null)} className="border px-4 py-1.5 rounded text-sm">ยกเลิก</button>
              <button onClick={handleSave} className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm hover:bg-primary/90">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
