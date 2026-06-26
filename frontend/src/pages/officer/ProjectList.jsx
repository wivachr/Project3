import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

const CANCEL_STATUSES = [17, 18];

export default function ProjectList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMsg, setEditMsg] = useState('');
  const [subjects, setSubjects] = useState([]);

  const load = async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/projects', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);
  useEffect(() => { api.get('/lookups/subjects').then(r => setSubjects(r.data)); }, []);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const handleCancel = async (r) => {
    if (!window.confirm(`ยกเลิกโครงการ "${r.name_project}" ?`)) return;
    try {
      await api.post(`/projects/${r.id_project}/cancel`);
      load(page, search);
    } catch (e) { alert(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const openEdit = async (r) => {
    const res = await api.get(`/projects/${r.id_project}`);
    const p = res.data;
    setEditForm({
      name_project: p.name_project || '',
      engname_project: p.engname_project || '',
      casestudy_project: p.casestudy_project || '',
      engcasestudy_project: p.engcasestudy_project || '',
      address_project: p.address_project || '',
      email_project: p.email_project || '',
      id_subject: p.id_subject || '',
      year_project: p.year_project || '',
      semester_project: p.semester_project || '',
    });
    setEditModal(r);
    setEditMsg('');
  };

  const handleEditSave = async () => {
    if (!editForm.name_project) { setEditMsg('กรุณากรอกชื่อโครงการ'); return; }
    try {
      await api.put(`/projects/${editModal.id_project}`, editForm);
      setEditModal(null);
      load(page, search);
    } catch (e) { setEditMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const columns = [
    { key: 'id_project', label: 'รหัสโครงการ', className: 'w-28 whitespace-nowrap' },
    { key: 'name_project', label: 'ชื่อโครงการ' },
    { key: 'year_project', label: 'ปี/ภาค', className: 'w-20 whitespace-nowrap', render: r => r.year_project ? `${r.year_project}/${r.semester_project}` : '-' },
    { key: 'name_statusproject', label: 'สถานะ', className: 'w-36 whitespace-nowrap' },
    { key: 'advisors', label: 'ที่ปรึกษา', className: 'w-52', render: r => r.advisors ? <span className="text-xs leading-snug line-clamp-3">{r.advisors}</span> : '-' },
    { key: 'members', label: 'สมาชิก', className: 'w-36', render: r => r.members ? <span className="text-xs leading-snug line-clamp-3">{r.members}</span> : '-' },
    { key: 'action', label: '', className: 'w-28 whitespace-nowrap', render: r => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="text-xs text-primary hover:underline">แก้ไข</button>
        {!CANCEL_STATUSES.includes(r.id_statusproject) && (
          <button onClick={() => handleCancel(r)} className="text-xs text-red-500 hover:underline">ยกเลิก</button>
        )}
      </div>
    )},
  ];

  const inp = (k, lbl, opts = {}) => (
    <div key={k} className="flex items-start gap-2">
      <label className="text-sm w-36 shrink-0 pt-1">{lbl}</label>
      {opts.textarea
        ? <textarea className="flex-1 border rounded px-2 py-1 text-sm" rows={2} value={editForm[k]} onChange={e => setEditForm(f => ({ ...f, [k]: e.target.value }))} />
        : <input className="flex-1 border rounded px-2 py-1 text-sm" value={editForm[k]} onChange={e => setEditForm(f => ({ ...f, [k]: e.target.value }))} />
      }
    </div>
  );

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">รายการโครงการ</h2>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหารหัส/ชื่อโครงการ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={setPage} />
      <p className="text-xs text-gray-400 mt-2">ทั้งหมด {total} รายการ</p>

      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold mb-4">แก้ไขโครงการ {editModal.id_project}</h3>
            <div className="space-y-3">
              {inp('name_project', 'ชื่อโครงการ (ไทย)', { textarea: true })}
              {inp('engname_project', 'ชื่อโครงการ (อังกฤษ)', { textarea: true })}
              {inp('casestudy_project', 'ปัญหา/ขอบเขต (ไทย)', { textarea: true })}
              {inp('engcasestudy_project', 'ปัญหา/ขอบเขต (อังกฤษ)', { textarea: true })}
              {inp('address_project', 'ที่อยู่')}
              {inp('email_project', 'อีเมล')}
              <div className="flex items-center gap-2">
                <label className="text-sm w-36 shrink-0">วิชา</label>
                <select className="flex-1 border rounded px-2 py-1 text-sm" value={editForm.id_subject} onChange={e => setEditForm(f => ({ ...f, id_subject: e.target.value }))}>
                  <option value="">-- เลือกวิชา --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
            {editMsg && <p className="text-red-500 text-sm mt-2">{editMsg}</p>}
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setEditModal(null)} className="border px-4 py-1.5 rounded text-sm">ยกเลิก</button>
              <button onClick={handleEditSave} className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm hover:bg-primary/90">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
