import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

export default function RegisterList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (p = page, k = search, y = year, s = semester) => {
    setLoading(true);
    try {
      const res = await api.get('/registers', { params: { page: p, limit: 20, key: k, year: y, semester: s } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key, year, semester); };
  const handleDelete = async (row) => {
    if (!window.confirm('ยืนยันการลบ?')) return;
    await api.delete('/registers', { data: { year_registration: row.year_registration, semester_registration: row.semester_registration, id_student: row.id_student, id_subject: row.id_subject, section: row.section } });
    load();
  };

  const columns = [
    { key: 'year_registration', label: 'ปีการศึกษา', className: 'w-24 whitespace-nowrap' },
    { key: 'semester_registration', label: 'ภาค', className: 'w-16 whitespace-nowrap' },
    { key: 'id_student', label: 'รหัสนักศึกษา', className: 'w-40 whitespace-nowrap' },
    { key: 'name_student', label: 'ชื่อ', render: r => r.name_student ? `${r.name_title || ''}${r.name_student} ${r.sname_student || ''}`.trim() : '-' },
    { key: 'id_subject', label: 'รหัสวิชา', className: 'w-24 whitespace-nowrap' },
    { key: 'name_subject', label: 'ชื่อวิชา', className: 'w-48' },
    { key: 'section', label: 'กลุ่ม', className: 'w-16 whitespace-nowrap' },
    { key: 'action', label: '', className: 'w-12', render: r => (
      <button onClick={() => handleDelete(r)} className="text-xs text-red-500 hover:underline">ลบ</button>
    )},
  ];

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">รายการลงทะเบียน</h2>
      <div className="flex gap-2 mb-3 flex-wrap">
        <input className="flex h-9 w-28 min-w-0 shrink-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="ปีการศึกษา" value={year} onChange={e => setYear(e.target.value)} />
        <select className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={semester} onChange={e => setSemester(e.target.value)}>
          <option value="">ทุกภาค</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
        <input className="flex h-9 min-w-40 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="ค้นหารหัสนักศึกษา/ชื่อ/วิชา..." value={key} onChange={e => setKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button onClick={handleSearch} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">ค้นหา</button>
      </div>
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); load(p, search, year, semester); }} />
      <p className="text-xs text-gray-400 mt-2">ทั้งหมด {total} รายการ</p>
    </div>
  );
}
