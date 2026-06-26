import { fmtDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

export default function TeacherExams() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/exams', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const columns = [
    { key: 'id_exam', label: '#', className: 'w-16 whitespace-nowrap' },
    { key: 'name_project', label: 'ชื่อโครงการ' },
    { key: 'name_typeexam', label: 'ประเภทสอบ', className: 'w-28 whitespace-nowrap' },
    { key: 'date_assignexam', label: 'วันที่สอบ', className: 'w-24 whitespace-nowrap', render: r => r.date_assignexam ? fmtDate(r.date_assignexam) : '-' },
    { key: 'time_assignexam', label: 'เวลา', className: 'w-28 whitespace-nowrap', render: r => r.time_assignexam ? `${r.time_assignexam}${r.endtime_assignexam ? '-'+r.endtime_assignexam : ''}` : '-' },
    { key: 'name_room', label: 'ห้อง', className: 'w-24 whitespace-nowrap', render: r => r.name_room || '-' },
    { key: 'result', label: 'ผลสอบ', className: 'w-20 whitespace-nowrap', render: r => [24,15,10,14,16].includes(r.id_statusproject) ? <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-700">ผ่าน</span> : [22,17,25].includes(r.id_statusproject) ? <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-600">ไม่ผ่าน</span> : <span className="inline-flex items-center rounded-full bg-muted border px-2 py-0.5 text-xs font-medium text-muted-foreground">รอผล</span> },
    { key: 'name_statusproject', label: 'สถานะโครงการ', className: 'w-44 whitespace-nowrap' },
  ];

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">ตารางสอบ</h2>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหาโครงการ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); load(p, search); }} />
      <p className="text-xs text-gray-400 mt-2">ทั้งหมด {total} รายการ</p>
    </div>
  );
}
