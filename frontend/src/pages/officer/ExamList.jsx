import { fmtDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';
import { ThaiDatePicker } from '@/components/ui/thai-date-picker';

export default function ExamList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [assignForm, setAssignForm] = useState({ date_assignexam: '', time_assignexam: '', endtime_assignexam: '', id_room: '' });
  const [rooms, setRooms] = useState([]);

  const load = async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/exams', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); api.get('/lookups/rooms').then(r => setRooms(r.data)); }, []);
  useEffect(() => { load(); }, [page]);

  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const handleAssign = async () => {
    await api.post(`/exams/${assignModal}/assign`, assignForm);
    setAssignModal(null);
    load();
  };

  const columns = [
    { key: 'id_exam', label: '#', className: 'w-16 whitespace-nowrap' },
    { key: 'name_project', label: 'ชื่อโครงการ' },
    { key: 'name_typeexam', label: 'ประเภทสอบ', className: 'w-28 whitespace-nowrap' },
    { key: 'name_statusproject', label: 'สถานะ', className: 'w-32 whitespace-nowrap' },
    { key: 'date_assignexam', label: 'วันที่สอบ', className: 'w-24 whitespace-nowrap', render: r => r.date_assignexam ? fmtDate(r.date_assignexam) : '-' },
    { key: 'time_assignexam', label: 'เวลา', className: 'w-28 whitespace-nowrap', render: r => r.time_assignexam ? `${r.time_assignexam}-${r.endtime_assignexam}` : '-' },
    { key: 'name_room', label: 'ห้อง', className: 'w-24 whitespace-nowrap', render: r => r.name_room || '-' },
    { key: 'action', label: '', className: 'w-24 whitespace-nowrap', render: r => (
      <button onClick={() => { setAssignModal(r.id_exam); setAssignForm({ date_assignexam: r.date_assignexam?.slice(0,10)||'', time_assignexam: r.time_assignexam||'', endtime_assignexam: r.endtime_assignexam||'', id_room: r.id_room||'' }); }}
        className="text-xs text-primary hover:underline">กำหนดวันสอบ</button>
    )},
  ];

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">รายการการสอบ</h2>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหาชื่อโครงการ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={setPage} />

      {assignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border rounded-lg shadow-lg p-6 w-80">
            <h3 className="font-bold mb-3">กำหนดวันสอบ</h3>
            <div className="space-y-2">
              <div><label className="text-sm">วันที่สอบ</label>
                <ThaiDatePicker value={assignForm.date_assignexam} className="w-full mt-1"
                  onChange={v => setAssignForm(f => ({ ...f, date_assignexam: v }))} /></div>
              <div><label className="text-sm">เวลาเริ่ม</label>
                <input type="time" className="w-full border rounded px-2 py-1 text-sm" value={assignForm.time_assignexam}
                  onChange={e => setAssignForm(f => ({ ...f, time_assignexam: e.target.value }))} /></div>
              <div><label className="text-sm">เวลาสิ้นสุด</label>
                <input type="time" className="w-full border rounded px-2 py-1 text-sm" value={assignForm.endtime_assignexam}
                  onChange={e => setAssignForm(f => ({ ...f, endtime_assignexam: e.target.value }))} /></div>
              <div><label className="text-sm">ห้องสอบ</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={assignForm.id_room}
                  onChange={e => setAssignForm(f => ({ ...f, id_room: e.target.value }))}>
                  <option value="">-- เลือกห้อง --</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAssign} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">บันทึก</button>
              <button onClick={() => setAssignModal(null)} className="border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
