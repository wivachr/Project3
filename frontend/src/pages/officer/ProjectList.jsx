import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

export default function ProjectList() {
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
      setData(res.data.data);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const columns = [
    { key: 'id_project', label: 'รหัสโครงการ', className: 'w-28 whitespace-nowrap' },
    { key: 'name_project', label: 'ชื่อโครงการ' },
    { key: 'year_project', label: 'ปี/ภาค', className: 'w-20 whitespace-nowrap', render: r => r.year_project ? `${r.year_project}/${r.semester_project}` : '-' },
    { key: 'name_statusproject', label: 'สถานะ', className: 'w-36 whitespace-nowrap' },
    { key: 'advisors', label: 'ที่ปรึกษา', className: 'w-52', render: r => r.advisors ? <span className="text-xs leading-snug line-clamp-3">{r.advisors}</span> : '-' },
    { key: 'members', label: 'สมาชิก', className: 'w-36', render: r => r.members ? <span className="text-xs leading-snug line-clamp-3">{r.members}</span> : '-' },
  ];

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">รายการโครงการ</h2>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหารหัส/ชื่อโครงการ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={setPage} />
      <p className="text-xs text-gray-400 mt-2">ทั้งหมด {total} รายการ</p>
    </div>
  );
}
