import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

const EMPTY = { id_teacher: '', id_user: '', id_academictitle: '', name_teacher: '', sname_teacher: '', initials_teacher: '', id_faculty: '', id_department: '', tel_teacher: '', email_teacher: '' };

export default function TeacherList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');
  const [lookups, setLookups] = useState({ academicTitles: [], faculties: [], departments: [] });

  const load = useCallback(async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/teachers', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(page, search); }, [page]);

  useEffect(() => {
    Promise.all([
      api.get('/lookups/academic-titles'),
      api.get('/lookups/faculties'),
      api.get('/lookups/departments'),
    ]).then(([at, f, d]) => setLookups({ academicTitles: at.data, faculties: f.data, departments: d.data }));
  }, []);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const openAdd = () => { setForm(EMPTY); setModal('add'); setMsg(''); };
  const openEdit = (r) => {
    setForm({ id_teacher: r.id_teacher, id_user: r.id_user || '', id_academictitle: r.id_academictitle || '', name_teacher: r.name_teacher || '', sname_teacher: r.sname_teacher || '', initials_teacher: r.initials_teacher || '', id_faculty: r.id_faculty || '', id_department: r.id_department || '', tel_teacher: r.tel_teacher || '', email_teacher: r.email_teacher || '' });
    setModal(r);
    setMsg('');
  };

  const handleSave = async () => {
    if (!form.name_teacher || !form.sname_teacher) { setMsg('กรุณากรอกชื่อและนามสกุล'); return; }
    try {
      if (modal === 'add') await api.post('/teachers', form);
      else await api.put(`/teachers/${modal.id_teacher}`, form);
      setModal(null);
      load(page, search);
    } catch (e) { setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`ลบอาจารย์ ${r.name_teacher} ${r.sname_teacher} ?`)) return;
    await api.delete(`/teachers/${r.id_teacher}`);
    load(page, search);
  };

  const columns = [
    { key: 'id_teacher', label: 'รหัส', className: 'w-16 whitespace-nowrap' },
    { key: 'name_teacher', label: 'ชื่อ', render: r => `${r.name_academictitle || ''}${r.name_teacher} ${r.sname_teacher}` },
    { key: 'name_faculty', label: 'คณะ', className: 'w-72 whitespace-nowrap' },
    { key: 'name_department', label: 'ภาควิชา', className: 'w-40 whitespace-nowrap' },
    { key: 'email_teacher', label: 'อีเมล', className: 'w-56' },
    { key: 'action', label: '', className: 'w-24 whitespace-nowrap', render: r => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="text-xs text-primary hover:underline">แก้ไข</button>
        <button onClick={() => handleDelete(r)} className="text-xs text-red-500 hover:underline">ลบ</button>
      </div>
    )},
  ];

  const inp = (k, lbl, opts = {}) => (
    <div key={k} className="flex items-center gap-2">
      <label className="text-sm w-28 shrink-0">{lbl}</label>
      <input className="flex-1 border rounded px-2 py-1 text-sm disabled:bg-gray-100" {...opts}
        value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
    </div>
  );
  const sel = (k, lbl, opts) => (
    <div key={k} className="flex items-center gap-2">
      <label className="text-sm w-28 shrink-0">{lbl}</label>
      <select className="flex-1 border rounded px-2 py-1 text-sm" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}>
        <option value="">-- เลือก --</option>
        {opts.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-xl tracking-tight">รายชื่ออาจารย์</h2>
        <button onClick={openAdd} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90">+ เพิ่ม</button>
      </div>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหารหัส/ชื่อ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); }} />
      <p className="text-xs text-gray-400 mt-2">ทั้งหมด {total} รายการ</p>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold mb-4">{modal === 'add' ? 'เพิ่มอาจารย์' : 'แก้ไขอาจารย์'}</h3>
            <div className="space-y-3">
              {inp('id_teacher', 'รหัสอาจารย์', { disabled: modal !== 'add', type: 'number' })}
              {inp('id_user', 'รหัสผู้ใช้', { type: 'number' })}
              {sel('id_academictitle', 'ตำแหน่งวิชาการ', lookups.academicTitles)}
              {inp('name_teacher', 'ชื่อ')}
              {inp('sname_teacher', 'นามสกุล')}
              {inp('initials_teacher', 'อักษรย่อ')}
              {sel('id_faculty', 'คณะ', lookups.faculties)}
              {sel('id_department', 'ภาควิชา', lookups.departments)}
              {inp('tel_teacher', 'โทรศัพท์')}
              {inp('email_teacher', 'อีเมล')}
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
