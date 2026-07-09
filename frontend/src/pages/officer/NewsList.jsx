import { fmtDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import api from '../../services/api';

const fileUrl = (p) => (p ? `http://localhost:5000${p.startsWith('/') ? p : '/' + p}` : null);

export default function NewsList() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ topic_news: '', detail_news: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/news');
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const uploadAttachments = async (id) => {
    if (pdfFile) {
      const fd = new FormData();
      fd.append('file', pdfFile);
      await api.post(`/news/${id}/upload-pdf`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    if (imageFile) {
      const fd = new FormData();
      fd.append('file', imageFile);
      await api.post(`/news/${id}/upload-image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      let id = editing;
      if (editing) { await api.put(`/news/${editing}`, form); }
      else { const res = await api.post('/news', form); id = res.data.id_news; }
      await uploadAttachments(id);
    } finally { setUploading(false); }
    setForm({ topic_news: '', detail_news: '' });
    setPdfFile(null);
    setImageFile(null);
    setEditing(null);
    load();
  };

  const handleEdit = (n) => { setEditing(n.id_news); setForm({ topic_news: n.topic_news, detail_news: n.detail_news }); setPdfFile(null); setImageFile(null); };
  const handleDelete = async (id) => { if (window.confirm('ยืนยันการลบ?')) { await api.delete(`/news/${id}`); load(); } };

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">จัดการข่าวประกาศ</h2>
      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="space-y-2">
          <input className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="หัวข้อข่าว"
            value={form.topic_news} onChange={e => setForm(f => ({ ...f, topic_news: e.target.value }))} />
          <textarea className="flex h-24 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="รายละเอียด"
            value={form.detail_news} onChange={e => setForm(f => ({ ...f, detail_news: e.target.value }))} />
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-muted-foreground">แนบ PDF:</span>
              <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0] || null)} className="text-xs" />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-muted-foreground">แนบรูปภาพ:</span>
              <input type="file" accept=".jpg,.jpeg,.png,.gif" onChange={e => setImageFile(e.target.files[0] || null)} className="text-xs" />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={uploading} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
              {uploading ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มข่าว'}
            </button>
            {editing && <button onClick={() => { setEditing(null); setForm({ topic_news: '', detail_news: '' }); setPdfFile(null); setImageFile(null); }} className="border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors">ยกเลิก</button>}
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
              <div className="flex items-center gap-3 mt-1">
                {n.pdf_news && <a href={fileUrl(n.pdf_news)} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">[PDF]</a>}
                {n.image_news && <a href={fileUrl(n.image_news)} target="_blank" rel="noreferrer" className="inline-block">
                  <img src={fileUrl(n.image_news)} alt="" className="h-12 w-12 object-cover rounded border" />
                </a>}
              </div>
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
