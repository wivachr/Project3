import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

export default function TeacherProjectList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/projects', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const columns = [
    { key: 'id_project', label: 'รหัส', className: 'w-24 whitespace-nowrap' },
    { key: 'name_project', label: 'ชื่อโครงการ' },
    { key: 'members', label: 'นักศึกษา', className: 'w-40', render: r => r.members ? <span className="text-xs leading-snug line-clamp-3">{r.members}</span> : '-' },
    { key: 'advisors', label: 'ที่ปรึกษา', className: 'w-56', render: r => r.advisors ? <span className="text-xs leading-snug line-clamp-3">{r.advisors}</span> : '-' },
    { key: 'name_statusproject', label: 'สถานะ', className: 'w-44 whitespace-nowrap', render: r => <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">{r.name_statusproject}</span> },
  ];

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">โครงการทั้งหมด</h2>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหาโครงการ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); load(p, search); }} />
      <p className="text-xs text-gray-400 mt-2">ทั้งหมด {total} โครงการ</p>
    </div>
  );
}
