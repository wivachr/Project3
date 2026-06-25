import { fmtDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

export default function SaveResult() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ id_statusproject: '', comment_exam: '' });
  const [statuses, setStatuses] = useState([]);

  const load = async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/exams', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); api.get('/lookups/status-projects').then(r => setStatuses(r.data)); }, []);
  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const openModal = (exam) => {
    setModal(exam);
    setForm({ id_statusproject: exam.id_statusproject || '', comment_exam: exam.comment_exam || '' });
  };

  const handleSave = async () => {
    if (!form.id_statusproject) return;
    await api.post(`/exams/${modal.id_exam}/result`, form);
    setModal(null);
    load();
  };

  const statusLabel = (s) => {
    const id = parseInt(s?.id_statusproject);
    if (id === 24) return <span className="text-green-600 font-medium">ผ่าน</span>;
    if (id === 22 || id === 17 || id === 25) return <span className="text-red-500 font-medium">ไม่ผ่าน</span>;
    return s?.name_statusproject || '-';
  };

  const columns = [
    { key: 'id_exam', label: '#' },
    { key: 'id_project', label: 'รหัสโครงการ' },
    { key: 'name_project', label: 'ชื่อโครงการ' },
    { key: 'name_typeexam', label: 'ประเภทสอบ' },
    { key: 'date_assignexam', label: 'วันที่สอบ', render: r => r.date_assignexam ? fmtDate(r.date_assignexam) : '-' },
    { key: 'name_statusproject', label: 'สถานะ' },
    { key: 'action', label: '', render: r => (
      <button onClick={() => openModal(r)} className="text-xs text-primary hover:underline">บันทึกผล</button>
    )},
  ];

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">บันทึกผลการสอบ</h2>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหาโครงการ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); load(p, search); }} />

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border rounded-lg shadow-lg p-6 w-80">
            <h3 className="font-bold mb-3">บันทึกผลการสอบ</h3>
            <p className="text-sm mb-3">{modal.name_project} — {modal.name_typeexam}</p>
            <div className="space-y-2">
              <div>
                <label className="text-sm">ผลการสอบ (สถานะ)</label>
                <select className="w-full border rounded px-2 py-1 text-sm mt-1" value={form.id_statusproject}
                  onChange={e => setForm(f => ({ ...f, id_statusproject: e.target.value }))}>
                  <option value="">-- เลือกผลการสอบ --</option>
                  {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm">หมายเหตุ</label>
                <textarea className="w-full border rounded px-2 py-1 text-sm mt-1 h-16 resize-none"
                  value={form.comment_exam} onChange={e => setForm(f => ({ ...f, comment_exam: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} disabled={!form.id_statusproject} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">บันทึก</button>
              <button onClick={() => setModal(null)} className="border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
