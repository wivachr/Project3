import { fmtDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

const TYPE_LABEL = { 1: 'สอบหัวข้อ', 2: 'สอบ 60%', 3: 'สอบ 100%' };
const APPROVE_STATUS = { 1: 3, 2: 12, 3: 15 }; // status after approval per typeexam

export default function PendingExam({ typeexam }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/exams', { params: { page: p, limit: 20, key: k, typeexam, pending: 1 } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, typeexam]);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const handleApprove = async (exam) => {
    if (!window.confirm(`ยืนยันรับเรื่อง${TYPE_LABEL[typeexam]}?`)) return;
    await api.post(`/exams/${exam.id_exam}/approve`, { id_statusproject: APPROVE_STATUS[typeexam] || 3 });
    load();
  };

  const columns = [
    { key: 'id_exam', label: '#' },
    { key: 'id_project', label: 'รหัสโครงการ' },
    { key: 'name_project', label: 'ชื่อโครงการ' },
    { key: 'name_typeexam', label: 'ประเภทสอบ' },
    { key: 'date_submitexam', label: 'วันที่ยื่น', render: r => r.date_submitexam ? fmtDate(r.date_submitexam) : '-' },
    { key: 'name_statusproject', label: 'สถานะ' },
    { key: 'action', label: '', render: r => (
      <button onClick={() => handleApprove(r)} className="text-xs text-primary hover:underline">รับเรื่อง</button>
    )},
  ];

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">รอ{TYPE_LABEL[typeexam] || 'สอบ'}</h2>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหาโครงการ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); load(p, search); }} />
      <p className="text-xs text-gray-400 mt-2">ทั้งหมด {total} รายการ</p>
    </div>
  );
}
