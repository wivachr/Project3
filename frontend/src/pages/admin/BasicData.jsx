import { useState, useEffect } from 'react';
import api from '../../services/api';

// Generic CRUD page for basic data tables
// fields: [{ key, label, type? ('text'|'number'), required? }]
export default function BasicData({ title, endpoint, idKey, fields }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // null=none, 'new'=add, {row}=edit
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/lookups/${endpoint}/all`);
      setData(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [endpoint]);

  const openAdd = () => {
    setForm(Object.fromEntries(fields.map(f => [f.key, ''])));
    setEditing('new');
    setMsg('');
  };

  const openEdit = (row) => {
    setForm({ ...row });
    setEditing(row);
    setMsg('');
  };

  const handleSave = async () => {
    const required = fields.filter(f => f.required);
    for (const f of required) {
      if (!form[f.key]) { setMsg(`กรุณากรอก${f.label}`); return; }
    }
    setMsg('');
    try {
      if (editing === 'new') {
        await api.post(`/lookups/${endpoint}`, form);
      } else {
        await api.put(`/lookups/${endpoint}/${editing[idKey]}`, form);
      }
      setEditing(null);
      load();
    } catch (e) { setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`ลบ "${row[fields[0].key]}" ?`)) return;
    try {
      await api.delete(`/lookups/${endpoint}/${row[idKey]}`);
      load();
    } catch (e) { alert(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
        <button onClick={openAdd} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">
          + เพิ่ม
        </button>
      </div>

      {editing && (
        <div className="bg-card border rounded-lg p-4 mb-4 max-w-lg">
          <h3 className="font-semibold text-sm mb-3">{editing === 'new' ? 'เพิ่มข้อมูล' : 'แก้ไขข้อมูล'}</h3>
          <div className="space-y-2">
            {fields.map(f => (
              <div key={f.key} className="flex items-center gap-2">
                <label className="text-sm w-40 shrink-0">{f.label}{f.required && <span className="text-red-500">*</span>}</label>
                <input
                  type={f.type || 'text'}
                  className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form[f.key] ?? ''}
                  onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          {msg && <p className="text-red-500 text-xs mt-2">{msg}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">บันทึก</button>
            <button onClick={() => setEditing(null)} className="border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors">ยกเลิก</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">กำลังโหลด...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="px-3 py-2 text-left w-16">รหัส</th>
                {fields.map(f => <th key={f.key} className="px-3 py-2 text-left">{f.label}</th>)}
                <th className="px-3 py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row[idKey]} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="px-3 py-2 border-b border-gray-100 text-gray-400">{row[idKey]}</td>
                  {fields.map(f => <td key={f.key} className="px-3 py-2 border-b border-gray-100">{row[f.key]}</td>)}
                  <td className="px-3 py-2 border-b border-gray-100">
                    <button onClick={() => openEdit(row)} className="text-xs text-primary hover:underline mr-2">แก้ไข</button>
                    <button onClick={() => handleDelete(row)} className="text-xs text-red-500 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={fields.length + 2} className="px-3 py-4 text-center text-gray-400">ไม่มีข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
