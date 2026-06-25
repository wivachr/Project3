import { fmtDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function NewsList() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ topic_news: '', detail_news: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/news');
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (editing) { await api.put(`/news/${editing}`, form); }
    else { await api.post('/news', form); }
    setForm({ topic_news: '', detail_news: '' });
    setEditing(null);
    load();
  };

  const handleEdit = (n) => { setEditing(n.id_news); setForm({ topic_news: n.topic_news, detail_news: n.detail_news }); };
  const handleDelete = async (id) => { if (window.confirm('ยืนยันการลบ?')) { await api.delete(`/news/${id}`); load(); } };

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">จัดการข่าวประกาศ</h2>
      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="space-y-2">
          <input className="w-full flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="หัวข้อข่าว"
            value={form.topic_news} onChange={e => setForm(f => ({ ...f, topic_news: e.target.value }))} />
          <textarea className="w-full flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-24" placeholder="รายละเอียด"
            value={form.detail_news} onChange={e => setForm(f => ({ ...f, detail_news: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">
              {editing ? 'บันทึกการแก้ไข' : 'เพิ่มข่าว'}
            </button>
            {editing && <button onClick={() => { setEditing(null); setForm({ topic_news: '', detail_news: '' }); }} className="border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors">ยกเลิก</button>}
          </div>
        </div>
      </div>

      {loading ? <p className="text-muted-foreground">กำลังโหลด...</p> : data.map(n => (
        <div key={n.id_news} className="bg-white rounded shadow p-3 mb-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm">{n.topic_news}</p>
              <p className="text-xs text-gray-400">{fmtDate(n.date_news)}</p>
              <div className="text-sm mt-1 break-words" dangerouslySetInnerHTML={{ __html: n.detail_news }} />
            </div>
            <div className="flex gap-2 ml-4 shrink-0">
              <button onClick={() => handleEdit(n)} className="text-xs text-primary hover:underline">แก้ไข</button>
              <button onClick={() => handleDelete(n.id_news)} className="text-xs text-red-500 hover:underline">ลบ</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
