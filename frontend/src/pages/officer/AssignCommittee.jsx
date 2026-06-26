import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

export default function AssignCommittee() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // project for committee assignment
  const [committee, setCommittee] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ id_teacher: '', position: 'ประธาน' });

  const load = async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/projects', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);
  useEffect(() => {
    api.get('/teachers').then(r => setTeachers(r.data.data || []));
  }, []);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const openModal = async (project) => {
    const res = await api.get(`/projects/${project.id_project}`);
    setCommittee(res.data.committee || []);
    setModal(project);
    setForm({ id_teacher: '', position: 'ประธาน' });
  };

  const handleAdd = async () => {
    if (!form.id_teacher) return;
    await api.post(`/projects/${modal.id_project}/committee`, form);
    const res = await api.get(`/projects/${modal.id_project}`);
    setCommittee(res.data.committee || []);
    setForm({ id_teacher: '', position: 'ประธาน' });
  };

  const handleRemove = async (cid) => {
    await api.delete(`/projects/${modal.id_project}/committee/${cid}`);
    const res = await api.get(`/projects/${modal.id_project}`);
    setCommittee(res.data.committee || []);
  };

  const columns = [
    { key: 'id_project', label: 'รหัสโครงการ' },
    { key: 'name_project', label: 'ชื่อโครงการ' },
    { key: 'name_statusproject', label: 'สถานะ' },
    { key: 'advisors', label: 'ที่ปรึกษา' },
    { key: 'action', label: '', render: r => (
      <button onClick={() => openModal(r)} className="text-xs text-primary hover:underline">จัดการกรรมการ</button>
    )},
  ];

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">มอบหมายกรรมการ</h2>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหาโครงการ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); load(p, search); }} />

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border rounded-lg shadow-lg p-6 w-[480px] max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold mb-1">{modal.id_project}: {modal.name_project}</h3>
            <p className="text-xs text-gray-500 mb-3">จัดการคณะกรรมการ</p>

            <div className="mb-3">
              <p className="text-sm font-semibold mb-2">กรรมการปัจจุบัน</p>
              {committee.length === 0 && <p className="text-muted-foreground text-sm">ยังไม่มีกรรมการ</p>}
              {committee.map(c => (
                <div key={c.id_committee} className="flex justify-between items-center text-sm border-b py-1">
                  <span>{c.position}: {c.name_academictitle}{c.name_teacher} {c.sname_teacher}</span>
                  <button onClick={() => handleRemove(c.id_committee)} className="text-xs text-red-500 hover:underline ml-2">ลบ</button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">เพิ่มกรรมการ</p>
              <select className="w-full border rounded px-2 py-1 text-sm" value={form.id_teacher} onChange={e => setForm(f => ({ ...f, id_teacher: e.target.value }))}>
                <option value="">-- เลือกอาจารย์ --</option>
                {teachers.map(t => <option key={t.id_teacher} value={t.id_teacher}>{t.name_academictitle}{t.name_teacher} {t.sname_teacher}</option>)}
              </select>
              <select className="w-full border rounded px-2 py-1 text-sm" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                <option value="ที่ปรึกษา">ที่ปรึกษา</option>
                <option value="ประธาน">ประธาน</option>
                <option value="กรรมการ">กรรมการ</option>
              </select>
              <button onClick={handleAdd} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors w-full">เพิ่มกรรมการ</button>
            </div>

            <button onClick={() => setModal(null)} className="mt-3 border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors w-full">ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
}
