import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Pagination, SearchBar } from '../../components/Table';

const RIGHT_LABEL = { 1: 'ผู้ดูแลระบบ', 2: 'เจ้าหน้าที่', 3: 'อาจารย์', 4: 'นักศึกษา' };

const emptyForm = { username: '', password: '', name_user: '', sname_user: '', id_right: '2', status_user: '1' };

export default function UserList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [key, setKey] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | 'add' | {user row}
  const [form, setForm] = useState(emptyForm);
  const [resetId, setResetId] = useState(null);
  const [newPwd, setNewPwd] = useState('');
  const [msg, setMsg] = useState('');

  const load = async (p = page, k = search) => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { page: p, limit: 20, key: k } });
      setData(res.data.data);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);
  const handleSearch = () => { setPage(1); setSearch(key); load(1, key); };

  const openAdd = () => { setForm(emptyForm); setModal('add'); setMsg(''); };
  const openEdit = (u) => {
    setForm({ username: u.username, password: '', name_user: u.name_user, sname_user: u.sname_user, id_right: String(u.id_right), status_user: String(u.status_user) });
    setModal(u);
    setMsg('');
  };

  const handleSave = async () => {
    if (!form.username) { setMsg('กรุณากรอก username'); return; }
    if (modal === 'add' && !form.password) { setMsg('กรุณากรอกรหัสผ่าน'); return; }
    setMsg('');
    try {
      if (modal === 'add') {
        await api.post('/users', form);
      } else {
        await api.put(`/users/${modal.id_user}`, form);
      }
      setModal(null);
      load(page, search);
    } catch (e) { setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`ลบผู้ใช้ "${u.username}" ?`)) return;
    try { await api.delete(`/users/${u.id_user}`); load(page, search); }
    catch (e) { alert(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const handleResetPassword = async () => {
    if (!newPwd) return;
    await api.post(`/users/${resetId}/reset-password`, { newPassword: newPwd });
    setResetId(null); setNewPwd('');
    alert('รีเซ็ตรหัสผ่านสำเร็จ');
  };

  const columns = [
    { key: 'id_user', label: '#' },
    { key: 'username', label: 'Username' },
    { key: 'fullname', label: 'ชื่อ-สกุล' },
    { key: 'id_right', label: 'สิทธิ์', render: r => RIGHT_LABEL[r.id_right] || r.id_right },
    { key: 'status_user', label: 'สถานะ', render: r => r.status_user == 1 ? <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-700">ใช้งาน</span> : <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-600">ระงับ</span> },
    { key: 'action', label: '', render: r => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="text-xs text-primary hover:underline">แก้ไข</button>
        <button onClick={() => { setResetId(r.id_user); setNewPwd(''); }} className="text-xs text-orange-500 hover:underline">รีเซ็ตPW</button>
        <button onClick={() => handleDelete(r)} className="text-xs text-red-500 hover:underline">ลบ</button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-xl tracking-tight">จัดการผู้ใช้</h2>
        <button onClick={openAdd} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">+ เพิ่มผู้ใช้</button>
      </div>
      <SearchBar value={key} onChange={setKey} onSearch={handleSearch} placeholder="ค้นหา username/ชื่อ..." />
      <Table columns={columns} data={data} loading={loading} />
      <Pagination page={page} total={total} limit={20} onPage={p => { setPage(p); load(p, search); }} />

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border rounded-lg shadow-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold mb-3">{modal === 'add' ? 'เพิ่มผู้ใช้' : 'แก้ไขผู้ใช้'}</h3>
            <div className="space-y-2">
              {[
                { k: 'username', lbl: 'Username', req: true, disabled: modal !== 'add' },
                { k: 'password', lbl: modal === 'add' ? 'รหัสผ่าน' : 'รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)', type: 'password', req: modal === 'add' },
                { k: 'name_user', lbl: 'ชื่อ', req: true },
                { k: 'sname_user', lbl: 'นามสกุล' },
              ].map(({ k, lbl, req, type, disabled }) => (
                <div key={k} className="flex items-center gap-2">
                  <label className="text-sm w-44 shrink-0">{lbl}{req && <span className="text-red-500">*</span>}</label>
                  <input type={type || 'text'} disabled={disabled}
                    className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:bg-muted disabled:cursor-not-allowed"
                    value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <label className="text-sm w-44 shrink-0">สิทธิ์</label>
                <select className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.id_right} onChange={e => setForm(f => ({ ...f, id_right: e.target.value }))}>
                  {Object.entries(RIGHT_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm w-44 shrink-0">สถานะ</label>
                <select className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.status_user} onChange={e => setForm(f => ({ ...f, status_user: e.target.value }))}>
                  <option value="1">ใช้งาน</option>
                  <option value="0">ระงับ</option>
                </select>
              </div>
            </div>
            {msg && <p className="text-red-500 text-xs mt-2">{msg}</p>}
            <div className="flex gap-2 mt-3">
              <button onClick={handleSave} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">บันทึก</button>
              <button onClick={() => setModal(null)} className="border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {resetId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border rounded-lg shadow-lg p-6 w-72">
            <h3 className="font-bold mb-3">รีเซ็ตรหัสผ่าน</h3>
            <input type="password" placeholder="รหัสผ่านใหม่" className="mb-3 flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={newPwd} onChange={e => setNewPwd(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={handleResetPassword} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">ยืนยัน</button>
              <button onClick={() => setResetId(null)} className="border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
