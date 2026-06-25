import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

export default function TeacherList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/teachers', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(page, search); }, [page]);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const columns = [
    { key: 'id_teacher', label: 'รหัสอาจารย์' },
    { key: 'name_teacher', label: 'ชื่อ', render: r => `${r.name_academictitle || ''}${r.name_teacher} ${r.sname_teacher}` },
    { key: 'name_faculty', label: 'คณะ' },
    { key: 'name_department', label: 'ภาควิชา' },
    { key: 'email_teacher', label: 'อีเมล' },
  ];

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">รายชื่ออาจารย์</h2>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหารหัส/ชื่อ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); }} />
      <p className="text-xs text-gray-400 mt-2">ทั้งหมด {total} รายการ</p>
    </div>
  );
}
