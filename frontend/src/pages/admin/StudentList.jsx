import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

export default function StudentList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/students', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const columns = [
    { key: 'id_student', label: 'รหัสนักศึกษา' },
    { key: 'name_student', label: 'ชื่อ', render: r => r.name_student ? `${r.name_title || ''}${r.name_student} ${r.sname_student || ''}`.trim() : '-' },
    { key: 'name_faculty', label: 'คณะ' },
    { key: 'name_department', label: 'ภาควิชา' },
  ];

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">รายชื่อนักศึกษา</h2>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหารหัส/ชื่อ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); load(p, search); }} />
      <p className="text-xs text-gray-400 mt-2">ทั้งหมด {total} รายการ</p>
    </div>
  );
}
