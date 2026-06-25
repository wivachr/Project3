import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

export default function MyProjects() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/projects/teacher', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const columns = [
    { key: 'id_project', label: 'รหัส' },
    { key: 'name_project', label: 'ชื่อโครงการ' },
    { key: 'members', label: 'นักศึกษา' },
    { key: 'year_project', label: 'ปี/ภาค', render: r => r.year_project ? `${r.year_project}/${r.semester_project}` : '-' },
    { key: 'name_statusproject', label: 'สถานะ', render: r => <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">{r.name_statusproject}</span> },
  ];

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">โครงการที่ปรึกษา</h2>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหาโครงการ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); load(p, search); }} />
      <p className="text-xs text-gray-400 mt-2">ทั้งหมด {total} โครงการ</p>
    </div>
  );
}
